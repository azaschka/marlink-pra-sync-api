import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NamedLockUtility } from './named-lock.utility';

/** A query runner whose answers are given per SQL statement; records the statements and how it ended. */
function fakeConnection(answers: { getLock?: () => Promise<unknown>; releaseLock?: () => Promise<unknown> } = {}) {
    const statements: string[] = [];
    const destroy = jest.fn();
    const release = jest.fn().mockResolvedValue(undefined);
    const query = jest.fn((sql: string) => {
        statements.push(sql);

        if (sql.startsWith('SELECT GET_LOCK')) {
            return answers.getLock?.() ?? Promise.resolve([{ acquired: 1 }]);
        }

        if (sql.startsWith('SELECT RELEASE_LOCK')) {
            return answers.releaseLock?.() ?? Promise.resolve([{ released: 1 }]);
        }

        return Promise.resolve([]);
    });
    const queryRunner = {
        connect: jest.fn().mockResolvedValue(undefined),
        query,
        release,
        databaseConnection: { destroy },
    };
    const dataSource = { createQueryRunner: () => queryRunner } as unknown as DataSource;

    return { dataSource, statements, destroy, release };
}

describe('NamedLockUtility', () => {
    let warn: jest.SpyInstance;

    beforeEach(() => {
        warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('holds the lock with a raised idle timeout and returns the connection restored to the pool', async () => {
        const connection = fakeConnection();

        const lock = await NamedLockUtility.tryAcquire(connection.dataSource, 'pra-sync:scan:7', 60000, true);
        await lock?.release();
        await lock?.release(); // idempotent

        expect(connection.statements).toEqual([
            'SET SESSION wait_timeout = 660',
            'SELECT GET_LOCK(?, 0) AS acquired',
            'SELECT RELEASE_LOCK(?)',
            'SET SESSION wait_timeout = @@GLOBAL.wait_timeout',
        ]);
        expect(connection.release).toHaveBeenCalledTimes(1);
        expect(connection.destroy).not.toHaveBeenCalled();
    });

    it('returns undefined when another session holds the lock', async () => {
        const connection = fakeConnection({ getLock: () => Promise.resolve([{ acquired: 0 }]) });

        await expect(NamedLockUtility.tryAcquire(connection.dataSource, 'job', 60000, true)).resolves.toBeUndefined();
        expect(connection.statements.at(-1)).toBe('SET SESSION wait_timeout = @@GLOBAL.wait_timeout');
        expect(connection.release).toHaveBeenCalledTimes(1);
        expect(connection.destroy).not.toHaveBeenCalled();
    });

    it('closes the connection instead of pooling it when RELEASE_LOCK fails, so the lock cannot stay held', async () => {
        const connection = fakeConnection({ releaseLock: () => Promise.reject(new Error('Lost connection')) });
        const lock = await NamedLockUtility.tryAcquire(connection.dataSource, 'job', 60000, true);

        await lock?.release();

        expect(connection.destroy).toHaveBeenCalledTimes(1);
        expect(connection.statements).not.toContain('SET SESSION wait_timeout = @@GLOBAL.wait_timeout');
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('Releasing the lock job failed'));
    });

    it('runs without the lock and closes the connection when GET_LOCK fails', async () => {
        const connection = fakeConnection({ getLock: () => Promise.reject(new Error('Query timeout')) });

        const lock = await NamedLockUtility.tryAcquire(connection.dataSource, 'job', 60000, true);
        await lock?.release();

        expect(lock).toBeDefined();
        expect(connection.destroy).toHaveBeenCalledTimes(1);
        expect(connection.statements).not.toContain('SELECT RELEASE_LOCK(?)');
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('running without it: Query timeout'));
    });

    it('does not touch the database when the lock is disabled', async () => {
        const connection = fakeConnection();

        const lock = await NamedLockUtility.tryAcquire(connection.dataSource, 'job', 60000, false);
        await lock?.release();

        expect(lock).toBeDefined();
        expect(connection.statements).toEqual([]);
    });
});
