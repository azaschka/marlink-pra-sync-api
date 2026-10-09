import { Logger } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { DatabaseConnectionUtility } from './database-connection.utility';

/** A held lock; release() is idempotent and never throws. */
export interface HeldNamedLock {
    release(): Promise<void>;
}

/**
 * MariaDB named lock (GET_LOCK with timeout 0) on a dedicated connection, so that several replicas do not run the
 * same job at the same time (scan cycle of a tenant, backup retention). The server releases the lock if the
 * connection or the process dies. Costs one pooled connection while the lock is held.
 *
 * - tryAcquire() returns undefined when another session holds the lock.
 * - When the lock cannot be requested because of a database error, the job runs without it (warning logged), as
 *   before the lock existed.
 * - A connection whose lock state is unknown (GET_LOCK or RELEASE_LOCK failed) is closed instead of returned to
 *   the pool: a pooled connection that still holds the lock would block the job on every replica until that
 *   connection dies.
 * - The session wait_timeout is raised while the lock is held (the connection is idle during the job) and
 *   restored before the connection goes back to the pool.
 *
 * Not cluster-wide on Galera; every caller has a switch to disable the lock there.
 */
export abstract class NamedLockUtility {
    private static readonly LOGGER = new Logger('NamedLock');
    private static readonly ACQUIRE_TIMEOUT_IN_MS = 5000;
    private static readonly IDLE_MARGIN_IN_SECONDS = 600;
    private static readonly NOT_USED: HeldNamedLock = { release: () => Promise.resolve() };

    public static async tryAcquire(
        dataSource: DataSource,
        name: string,
        holdForMs: number,
        enabled: boolean,
    ): Promise<HeldNamedLock | undefined> {
        if (!enabled) {
            return NamedLockUtility.NOT_USED;
        }

        let queryRunner: QueryRunner | undefined;

        try {
            queryRunner = await DatabaseConnectionUtility.acquireQueryRunner(
                dataSource,
                NamedLockUtility.ACQUIRE_TIMEOUT_IN_MS,
            );
            const idleSeconds = Math.ceil(holdForMs / 1000) + NamedLockUtility.IDLE_MARGIN_IN_SECONDS;
            await queryRunner.query(`SET SESSION wait_timeout = ${idleSeconds}`);
            const rows: unknown = await queryRunner.query('SELECT GET_LOCK(?, 0) AS acquired', [name]);

            if (Number((rows as { acquired?: unknown }[])[0]?.acquired) === 1) {
                return NamedLockUtility.handle(queryRunner, name);
            }

            await NamedLockUtility.restoreAndRelease(queryRunner);

            return undefined;
        } catch (error) {
            if (queryRunner) {
                await DatabaseConnectionUtility.discard(queryRunner);
            }

            NamedLockUtility.LOGGER.warn(
                `Could not request the lock ${name}, running without it: ${NamedLockUtility.describe(error)}`,
            );

            return NamedLockUtility.NOT_USED;
        }
    }

    private static handle(queryRunner: QueryRunner, name: string): HeldNamedLock {
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
                    NamedLockUtility.LOGGER.warn(
                        `Releasing the lock ${name} failed, closing its connection so that the server releases it: ${NamedLockUtility.describe(error)}`,
                    );
                    await DatabaseConnectionUtility.discard(queryRunner);

                    return;
                }

                await NamedLockUtility.restoreAndRelease(queryRunner);
            },
        };
    }

    // Session variables survive in the pool, so the default idle timeout is restored before the connection goes back.
    private static async restoreAndRelease(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query('SET SESSION wait_timeout = @@GLOBAL.wait_timeout');
        } catch {
            await DatabaseConnectionUtility.discard(queryRunner);

            return;
        }

        await queryRunner.release().catch(() => undefined);
    }

    private static describe(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
