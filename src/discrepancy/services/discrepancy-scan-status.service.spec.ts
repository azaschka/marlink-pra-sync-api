import { HealthContributorRegistry } from '../../observability/services/health-contributor-registry.service';
import { DiscrepancyEntityType, DiscrepancyScanState } from '../enums';
import { DiscrepancyOverview } from '../models';
import { DiscrepancyScanStatusService } from './discrepancy-scan-status.service';
import { BackgroundCounters } from './scan-coordinator.service';

const background: BackgroundCounters = {
    relationDone: 0,
    relationFailed: 0,
    autoSyncDone: 0,
    autoSyncFailed: 0,
    dropped: 0,
};

function overview(state: DiscrepancyScanState, failureKind?: string): DiscrepancyOverview {
    return {
        entityType: DiscrepancyEntityType.User,
        totalBtData: 0,
        totalDbData: 0,
        identicalIds: [],
        onlyInExternalIds: [],
        onlyInInternalIds: [],
        mismatchedIds: [],
        state,
        failureKind,
    };
}

describe('DiscrepancyScanStatusService', () => {
    let registry: HealthContributorRegistry;
    let service: DiscrepancyScanStatusService;

    beforeEach(() => {
        registry = new HealthContributorRegistry();
        service = new DiscrepancyScanStatusService(registry);
    });

    it('registers itself as the discrepancyScan check', async () => {
        const entries = await registry.collect();

        expect(entries.discrepancyScan?.status).toBe('up');
    });

    it('is up after a fully successful cycle', () => {
        service.record(1, {
            status: 'completed',
            scanId: 'a',
            overviews: [overview(DiscrepancyScanState.Succeeded)],
            background,
            backgroundUnfinished: false,
        });

        expect(service.check().status).toBe('up');
    });

    it('warns about a tenant whose last cycle failed, e.g. an unavailable BeyondTrust instance', () => {
        service.record(1, {
            status: 'completed',
            scanId: 'a',
            overviews: [overview(DiscrepancyScanState.Succeeded)],
            background,
            backgroundUnfinished: false,
        });
        service.record(2, {
            status: 'completed',
            scanId: 'b',
            overviews: [
                overview(DiscrepancyScanState.Failed, 'NotFound'),
                overview(DiscrepancyScanState.Skipped, 'InstanceUnavailable'),
            ],
            background,
            backgroundUnfinished: false,
        });

        const check = service.check();

        expect(check.status).toBe('warning');
        expect(check.critical).toBe(false);
        expect(check.message).toBe('tenant 2: last cycle failed');
        expect(check.tenants).toEqual([
            expect.objectContaining({ tenantId: 1, lastState: 'succeeded' }),
            expect.objectContaining({ tenantId: 2, lastState: 'failed', lastSucceededAt: null }),
        ]);
    });

    it('warns when no cycle succeeded for more than 2 hours (stale results)', () => {
        const start = new Date('2026-10-01T08:00:00Z');
        service.record(
            1,
            {
                status: 'completed',
                scanId: 'a',
                overviews: [overview(DiscrepancyScanState.Succeeded)],
                background,
                backgroundUnfinished: false,
            },
            start,
        );
        service.record(
            1,
            { status: 'skipped', reason: 'cycle x (cron) active since …' },
            new Date('2026-10-01T09:00:00Z'),
        );

        expect(service.check(Date.parse('2026-10-01T09:59:00Z')).status).toBe('up');
        expect(service.check(Date.parse('2026-10-01T10:01:00Z'))).toEqual(
            expect.objectContaining({ status: 'warning', message: 'tenant 1: no successful cycle for more than 2 h' }),
        );
    });

    it('counts a tenant that another replica scans as current, also after an earlier failure here', () => {
        const start = new Date(); // staleness also counts from the process start
        service.record(
            1,
            {
                status: 'completed',
                scanId: 'a',
                overviews: [overview(DiscrepancyScanState.Failed, 'NotFound')],
                background,
                backgroundUnfinished: false,
            },
            start,
        );
        for (let hour = 1; hour <= 4; hour++) {
            service.record(
                1,
                { status: 'skipped', reason: 'cycle active in another Sync API instance' },
                new Date(start.getTime() + hour * 60 * 60 * 1000),
            );
        }

        expect(service.check(start.getTime() + 4.5 * 60 * 60 * 1000)).toEqual(
            expect.objectContaining({ status: 'up' }),
        );
        // Without the other replica the staleness rule applies again after 2 h.
        expect(service.check(start.getTime() + (6 * 60 + 1) * 60 * 1000).status).toBe('warning');
    });

    it('forgets tenants whose BeyondTrust instance no longer exists', () => {
        service.record(1, {
            status: 'completed',
            scanId: 'a',
            overviews: [overview(DiscrepancyScanState.Failed)],
            background,
            backgroundUnfinished: false,
        });
        service.record(2, {
            status: 'completed',
            scanId: 'b',
            overviews: [overview(DiscrepancyScanState.Succeeded)],
            background,
            backgroundUnfinished: false,
        });

        service.retainOnly([2]);

        expect(service.check()).toEqual(
            expect.objectContaining({ status: 'up', tenants: [expect.objectContaining({ tenantId: 2 })] }),
        );
    });

    it('reports a cycle whose background work did not finish in time as partial', () => {
        service.record(1, {
            status: 'completed',
            scanId: 'a',
            overviews: [overview(DiscrepancyScanState.Succeeded)],
            background,
            backgroundUnfinished: true,
        });

        expect(service.check().message).toBe('tenant 1: last cycle partial');
    });
});
