/**
 * Opt-in integration test against a real MariaDB (skipped unless PRA_TEST_MARIADB_HOST is set), see
 * discrepancy-repository.mariadb.spec.ts for the variables. Two DataSources play two Sync API replicas.
 */
import { DataSource } from 'typeorm';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { ResourceReportRegistry } from '../../observability/services/resource-report-registry.service';
import { DistributedScanLockService } from './distributed-scan-lock.service';
import { ScanCoordinatorService } from './scan-coordinator.service';

const host = process.env.PRA_TEST_MARIADB_HOST;
const describeWithMariaDb = host ? describe : describe.skip;

const appConfigService = {
    discrepancy: {
        scan: {
            cycleBudgetInMs: 60000,
            relationScanConcurrency: 2,
            autoSyncConcurrency: 3,
            backgroundQueueCapacity: 5000,
            distributedLockEnabled: true,
        },
    },
} as unknown as AppConfigService;

describeWithMariaDb('DistributedScanLockService on MariaDB', () => {
    const dataSources: DataSource[] = [];

    const replica = async () => {
        const dataSource = new DataSource({
            type: 'mariadb',
            connectorPackage: 'mysql2',
            host,
            port: Number(process.env.PRA_TEST_MARIADB_PORT ?? 3306),
            username: process.env.PRA_TEST_MARIADB_USER ?? 'pra',
            password: process.env.PRA_TEST_MARIADB_PASSWORD ?? 'pra',
            database: process.env.PRA_TEST_MARIADB_DATABASE ?? 'pra_it',
            entities: [],
            extra: { connectionLimit: 2 },
        });
        await dataSource.initialize();
        dataSources.push(dataSource);

        return {
            dataSource,
            coordinator: new ScanCoordinatorService(
                appConfigService,
                new DistributedScanLockService(dataSource, appConfigService),
                new ResourceReportRegistry(),
            ),
        };
    };

    afterAll(async () => {
        await Promise.all(dataSources.map((dataSource) => dataSource.destroy()));
    });

    it('runs only one cycle per tenant across two replicas and releases the lock afterwards', async () => {
        const a = await replica();
        const b = await replica();
        let release: () => void = () => undefined;

        const first = a.coordinator.runCycle(
            424242,
            'cron',
            () => new Promise((resolve) => (release = () => resolve([]))),
        );
        await new Promise((resolve) => setTimeout(resolve, 200));
        const second = await b.coordinator.runCycle(424242, 'cron', () => Promise.resolve([]));
        const otherTenant = await b.coordinator.runCycle(424243, 'cron', () => Promise.resolve([]));
        release();

        expect(second).toEqual({ status: 'skipped', reason: 'cycle active in another Sync API instance' });
        expect(otherTenant.status).toBe('completed');
        await expect(first).resolves.toEqual(expect.objectContaining({ status: 'completed' }));

        // Released: the other replica can run the tenant now.
        await expect(b.coordinator.runCycle(424242, 'cron', () => Promise.resolve([]))).resolves.toEqual(
            expect.objectContaining({ status: 'completed' }),
        );
    }, 30000);

    it('restores the session wait_timeout before the connection goes back to the pool', async () => {
        const { dataSource } = await replica();
        const lockService = new DistributedScanLockService(dataSource, appConfigService);
        const global: unknown = await dataSource.query('SELECT @@GLOBAL.wait_timeout AS value');

        const lock = await lockService.tryAcquire(424244, 60000);
        await lock?.release();

        // connectionLimit 2: the next queries reuse the pooled lock connection.
        const sessions = await Promise.all(
            [1, 2].map(async () => (await dataSource.query('SELECT @@SESSION.wait_timeout AS value')) as unknown),
        );
        for (const session of sessions) {
            expect(Number((session as { value: string }[])[0]?.value)).toBe(
                Number((global as { value: string }[])[0]?.value),
            );
        }
    }, 30000);
});
