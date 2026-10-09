import { Injectable } from '@nestjs/common';
import { HealthCheckEntry } from '../../observability/models/health-check-entry.model';
import { HealthContributorRegistry } from '../../observability/services/health-contributor-registry.service';
import { DiscrepancyScanState } from '../enums';
import { DiscrepancyScanOutcome } from './discrepancy-scan-outcome';
import { CycleOutcome, ScanCoordinatorService } from './scan-coordinator.service';

interface TenantScanStatus {
    tenantId: number;
    lastState?: 'succeeded' | 'partial' | 'failed';
    lastScanId?: string;
    lastFinishedAt?: string;
    lastSucceededAt: string | null;
    summary?: string;
    lastSkippedAt?: string;
    lastSkipReason?: string;
    /** Last time this tenant was skipped because another Sync API replica held its scan lock. */
    lastScannedElsewhereAt?: string;
}

/**
 * Remembers the outcome of the last scan cycle per tenant and reports it as the non-critical diagnostic check
 * discrepancyScan: a warning when the last cycle of a tenant did not fully succeed, or when no cycle succeeded
 * within STALE_AFTER_IN_MS (a stale sync result). In memory, per process.
 *
 * With several replicas the distributed lock spreads the tenants across the pods. A tenant that is skipped
 * because another replica scans it counts as current here; that replica reports its outcome. Tenants whose
 * BeyondTrust instance no longer exists are dropped on the next cron tick (retainOnly).
 */
@Injectable()
export class DiscrepancyScanStatusService {
    // Four times the 30 minute cron interval.
    public static readonly STALE_AFTER_IN_MS = 2 * 60 * 60 * 1000;

    private readonly tenants = new Map<number, TenantScanStatus>();
    private readonly startedAt = Date.now();

    constructor(healthContributorRegistry: HealthContributorRegistry) {
        healthContributorRegistry.register('discrepancyScan', () => this.check());
    }

    public record(tenantId: number, outcome: CycleOutcome, now: Date = new Date()): void {
        const status = this.tenants.get(tenantId) ?? { tenantId, lastSucceededAt: null };

        if (outcome.status === 'skipped') {
            status.lastSkippedAt = now.toISOString();
            status.lastSkipReason = outcome.reason;

            if (outcome.reason === ScanCoordinatorService.LOCKED_ELSEWHERE_REASON) {
                status.lastScannedElsewhereAt = now.toISOString();
            }
        } else {
            const summary = DiscrepancyScanOutcome.summarize(outcome.overviews);
            const anySucceeded = outcome.overviews.some((o) => o.state === DiscrepancyScanState.Succeeded);
            status.lastState =
                summary.allSucceeded && !outcome.backgroundUnfinished
                    ? 'succeeded'
                    : anySucceeded
                      ? 'partial'
                      : 'failed';
            status.lastScanId = outcome.scanId;
            status.lastFinishedAt = now.toISOString();
            status.summary = summary.text;

            if (status.lastState === 'succeeded') {
                status.lastSucceededAt = now.toISOString();
            }
        }

        this.tenants.set(tenantId, status);
    }

    /** Forgets tenants that are not in the current list of BeyondTrust instances. */
    public retainOnly(tenantIds: Iterable<number>): void {
        const current = new Set(tenantIds);

        for (const tenantId of [...this.tenants.keys()]) {
            if (!current.has(tenantId)) {
                this.tenants.delete(tenantId);
            }
        }
    }

    public check(now: number = Date.now()): HealthCheckEntry {
        const tenants = [...this.tenants.values()].sort((a, b) => a.tenantId - b.tenantId);
        const problems: string[] = [];

        for (const tenant of tenants) {
            const lastSuccess = Math.max(
                tenant.lastSucceededAt ? Date.parse(tenant.lastSucceededAt) : this.startedAt,
                tenant.lastScannedElsewhereAt ? Date.parse(tenant.lastScannedElsewhereAt) : 0,
            );

            // An outcome of this process is outdated once another replica has scanned the tenant since.
            const scannedElsewhereSince =
                !!tenant.lastScannedElsewhereAt &&
                (!tenant.lastFinishedAt || tenant.lastScannedElsewhereAt > tenant.lastFinishedAt);

            if (tenant.lastState && tenant.lastState !== 'succeeded' && !scannedElsewhereSince) {
                problems.push(`tenant ${tenant.tenantId}: last cycle ${tenant.lastState}`);
            } else if (now - lastSuccess > DiscrepancyScanStatusService.STALE_AFTER_IN_MS) {
                problems.push(`tenant ${tenant.tenantId}: no successful cycle for more than 2 h`);
            }
        }

        return {
            status: problems.length > 0 ? 'warning' : 'up',
            critical: false,
            tenants: tenants.map((tenant) => ({ ...tenant })),
            ...(problems.length > 0 ? { message: problems.join('; ') } : {}),
            ...(tenants.length === 0 ? { message: 'No scan cycle has finished since the start' } : {}),
            checkedAt: new Date(now).toISOString(),
        };
    }
}
