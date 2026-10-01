import { Injectable } from '@nestjs/common';
import { HealthCheckEntry } from '../../observability/models/health-check-entry.model';
import { HealthContributorRegistry } from '../../observability/services/health-contributor-registry.service';
import { DiscrepancyScanState } from '../enums';
import { DiscrepancyScanOutcome } from './discrepancy-scan-outcome';
import { CycleOutcome } from './scan-coordinator.service';

interface TenantScanStatus {
    tenantId: number;
    lastState?: 'succeeded' | 'partial' | 'failed';
    lastScanId?: string;
    lastFinishedAt?: string;
    lastSucceededAt: string | null;
    summary?: string;
    lastSkippedAt?: string;
    lastSkipReason?: string;
}

/**
 * Remembers the outcome of the last scan cycle per tenant and reports it as the non-critical diagnostic check
 * discrepancyScan: a warning when the last cycle of a tenant did not fully succeed, or when no cycle succeeded
 * within STALE_AFTER_IN_MS (a stale sync result). In memory, per process.
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

    public check(now: number = Date.now()): HealthCheckEntry {
        const tenants = [...this.tenants.values()].sort((a, b) => a.tenantId - b.tenantId);
        const problems: string[] = [];

        for (const tenant of tenants) {
            const lastSuccess = tenant.lastSucceededAt ? Date.parse(tenant.lastSucceededAt) : this.startedAt;

            if (tenant.lastState && tenant.lastState !== 'succeeded') {
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
