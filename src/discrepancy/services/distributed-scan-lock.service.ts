import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { HeldNamedLock, NamedLockUtility } from '../../shared/utilities/named-lock.utility';

/** A held tenant scan lock. release() is idempotent and never throws. */
export type DistributedScanLock = HeldNamedLock;

/**
 * MariaDB named lock per tenant (NamedLockUtility) so that several replicas of the Sync API never run the same
 * tenant's scan cycle at the same time. The lock lives on a dedicated connection for the duration of the cycle.
 *
 * Switchable off with DISCREPANCY_SCAN_DISTRIBUTED_LOCK_ENABLED=false (for example on Galera, where GET_LOCK is not
 * cluster-wide). If the lock cannot be requested because of a database error, the cycle runs without it (the
 * behaviour before this lock existed) and a warning is logged.
 */
@Injectable()
export class DistributedScanLockService {
    private static readonly LOCK_NAME_PREFIX = 'pra-sync:scan:';

    constructor(
        private readonly dataSource: DataSource,
        private readonly appConfigService: AppConfigService,
    ) {}

    /** Returns the held lock, or undefined when another process holds it. */
    public tryAcquire(tenantId: number, holdForMs: number): Promise<DistributedScanLock | undefined> {
        return NamedLockUtility.tryAcquire(
            this.dataSource,
            `${DistributedScanLockService.LOCK_NAME_PREFIX}${tenantId}`,
            holdForMs,
            this.appConfigService.discrepancy.scan.distributedLockEnabled,
        );
    }
}
