/* eslint-disable @typescript-eslint/naming-convention -- column names */
/**
 * Opt-in integration test against a real MariaDB (skipped unless PRA_TEST_MARIADB_HOST is set), e.g.
 * PRA_TEST_MARIADB_HOST=127.0.0.1 PRA_TEST_MARIADB_USER=pra PRA_TEST_MARIADB_PASSWORD=pra
 * PRA_TEST_MARIADB_DATABASE=pra_it npx jest discrepancy-repository.mariadb
 *
 * Verifies on a real server that the cleanup of a scan keeps the records of the same run (constant, truncated
 * start) and removes older ones, and that relation cleanup is scoped to its parent.
 */
import { DataSource } from 'typeorm';
import { DiscrepancyEntityType } from '../../enums';
import { DiscrepancyRepositoryService } from './discrepancy-repository.service';

const host = process.env.PRA_TEST_MARIADB_HOST;
const describeWithMariaDb = host ? describe : describe.skip;

describeWithMariaDb('DiscrepancyRepositoryService on MariaDB', () => {
    const tenantId = 990001;
    let dataSource: DataSource;
    let repository: DiscrepancyRepositoryService;

    const waitForMillisecondsWithinSecond = async (from: number, to: number) => {
        while (Date.now() % 1000 < from || Date.now() % 1000 > to) {
            await new Promise((resolve) => setTimeout(resolve, 5));
        }
    };

    const count = async (): Promise<number> => {
        const rows: unknown = await dataSource.query(`SELECT COUNT(*) AS n FROM discrepancies_${tenantId}`);

        return Number((rows as { n: string }[])[0]?.n);
    };

    const entityIds = async (): Promise<number[]> => {
        const rows: unknown = await dataSource.query(`SELECT entity_id FROM discrepancies_${tenantId}`);

        return (rows as { entity_id: number }[]).map((row) => Number(row.entity_id));
    };

    beforeAll(async () => {
        dataSource = new DataSource({
            type: 'mariadb',
            connectorPackage: 'mysql2',
            host,
            port: Number(process.env.PRA_TEST_MARIADB_PORT ?? 3306),
            username: process.env.PRA_TEST_MARIADB_USER ?? 'pra',
            password: process.env.PRA_TEST_MARIADB_PASSWORD ?? 'pra',
            database: process.env.PRA_TEST_MARIADB_DATABASE ?? 'pra_it',
            entities: [],
            synchronize: false,
        });
        await dataSource.initialize();
        repository = new DiscrepancyRepositoryService(dataSource);
        await repository.createAndConnectTable(tenantId);
    }, 30000);

    afterAll(async () => {
        await dataSource?.query(`DROP TABLE IF EXISTS discrepancies_${tenantId}`);
        await dataSource?.destroy();
    });

    beforeEach(async () => {
        await dataSource.query(`DELETE FROM discrepancies_${tenantId}`);
    });

    const write = (entityId: number, lastModificationDate: Date, parentId?: number) =>
        repository.createOrUpdateById(tenantId, {
            entityType: parentId === undefined ? DiscrepancyEntityType.User : DiscrepancyEntityType.TeamUser,
            entityId: parentId ?? entityId,
            foreignEntityId: parentId === undefined ? undefined : entityId,
            internalData: undefined,
            externalData: { id: entityId },
            lastModificationDate,
        });

    it('keeps a record written 300 ms after a truncated start and removes older ones', async () => {
        await waitForMillisecondsWithinSecond(100, 400);
        const start = new Date(Math.floor(Date.now() / 1000) * 1000);
        await write(1, new Date(start.getTime() - 60000)); // stale record of an earlier run
        await new Promise((resolve) => setTimeout(resolve, 300));
        await write(2, start); // record of this run, stamped with the run's start

        await repository.deleteByLastModificationDateBefore(tenantId, DiscrepancyEntityType.User, start);

        expect(await entityIds()).toEqual([2]);
    });

    it('stores fractional seconds, so the own-cleanup loss does not occur with the TypeORM schema', async () => {
        // Correction of finding F-17: TypeORM creates the update date column as timestamp(6).
        const columns: unknown = await dataSource.query(
            `SHOW COLUMNS FROM discrepancies_${tenantId} WHERE Field = 'last_modification_date'`,
        );
        expect((columns as { Type: string }[])[0]?.Type).toBe('timestamp(6)');

        await waitForMillisecondsWithinSecond(100, 400);
        const untruncatedStart = new Date();
        await new Promise((resolve) => setTimeout(resolve, 300));
        await write(3, new Date());

        await repository.deleteByLastModificationDateBefore(tenantId, DiscrepancyEntityType.User, untruncatedStart);

        expect(await count()).toBe(1);
    });

    it('cleans up only the given relation parent', async () => {
        const start = new Date(Math.floor(Date.now() / 1000) * 1000);
        const stale = new Date(start.getTime() - 60000);
        await write(10, stale, 100);
        await write(11, stale, 200);

        await repository.deleteByEntityIdAndLastModificationDateBefore(
            tenantId,
            DiscrepancyEntityType.TeamUser,
            100,
            start,
        );

        expect(await entityIds()).toEqual([200]);
    });
});
