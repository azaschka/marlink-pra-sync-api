import { Injectable, Logger } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { DatabaseConnectionUtility } from '../../shared/utilities/database-connection.utility';

/** A held tenant scan lock. release() is idempotent and never throws. */
export interface DistributedScanLock {
    release(): Promise<void>;
}

/**
 * MariaDB named lock per tenant (GET_LOCK) so that several replicas of the Sync API never run the same tenant's
 * scan cycle at the same time. The lock lives on a dedicated connection for the duration of the cycle; the server
 * releases it automatically if the process dies. Costs one pooled connection per active cycle.
 *
 * Switchable off with DISCREPANCY_SCAN_DISTRIBUTED_LOCK_ENABLED=false (for example on Galera, where GET_LOCK is not
 * cluster-wide). If the lock cannot be requested because of a database error, the cycle runs without it (the
 * behaviour before this lock existed) and a warning is logged.
 */
@Injectable()
export class DistributedScanLockService {
    private static readonly LOCK_NAME_PREFIX = 'pra-sync:scan:';
    private static readonly ACQUIRE_TIMEOUT_IN_MS = 5000;
    // The lock connection is idle while the cycle runs; it must outlive the cycle budget.
    private static readonly IDLE_MARGIN_IN_SECONDS = 600;
    private static readonly NOT_USED: DistributedScanLock = { release: () => Promise.resolve() };

    private readonly logger = new Logger(DistributedScanLockService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly appConfigService: AppConfigService,
    ) {}

    /** Returns the held lock, or undefined when another process holds it. */
    public async tryAcquire(tenantId: number, holdForMs: number): Promise<DistributedScanLock | undefined> {
        if (!this.appConfigService.discrepancy.scan.distributedLockEnabled) {
            return DistributedScanLockService.NOT_USED;
        }

        const name = `${DistributedScanLockService.LOCK_NAME_PREFIX}${tenantId}`;
        let queryRunner: QueryRunner | undefined;

        try {
            queryRunner = await DatabaseConnectionUtility.acquireQueryRunner(
                this.dataSource,
                DistributedScanLockService.ACQUIRE_TIMEOUT_IN_MS,
            );
            const idleSeconds = Math.ceil(holdForMs / 1000) + DistributedScanLockService.IDLE_MARGIN_IN_SECONDS;
            await queryRunner.query(`SET SESSION wait_timeout = ${idleSeconds}`);
            const rows: unknown = await queryRunner.query('SELECT GET_LOCK(?, 0) AS acquired', [name]);

            if (Number((rows as { acquired?: unknown }[])[0]?.acquired) === 1) {
                return this.createHandle(queryRunner, name);
            }

            await DistributedScanLockService.restoreAndRelease(queryRunner);

            return undefined;
        } catch (error) {
            if (queryRunner) {
                await DistributedScanLockService.restoreAndRelease(queryRunner);
            }

            this.logger.warn(
                `Could not request the scan lock for tenant ${tenantId}, the cycle runs without it: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );

            return DistributedScanLockService.NOT_USED;
        }
    }

    private createHandle(queryRunner: QueryRunner, name: string): DistributedScanLock {
        let released = false;

        return {
            release: async () => {
                if (released) {
                    return;
                }
                released = true;

                try {
                    await queryRunner.query('SELECT RELEASE_LOCK(?)', [name]);
                } catch (error) {
                    // The server releases the lock with the connection anyway.
                    this.logger.warn(
                        `Releasing the scan lock ${name} failed: ${error instanceof Error ? error.message : String(error)}`,
                    );
                }

                await DistributedScanLockService.restoreAndRelease(queryRunner);
            },
        };
    }

    // Session variables survive in the pool, so the default idle timeout is restored before the connection goes back.
    private static async restoreAndRelease(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query('SET SESSION wait_timeout = @@GLOBAL.wait_timeout');
        } catch {
            // the connection is broken; release() below discards it
        }

        try {
            await queryRunner.release();
        } catch {
            // already released
        }
    }
}
