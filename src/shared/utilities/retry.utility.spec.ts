import { RetryUtility } from './retry.utility';

describe('RetryUtility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('delay', () => {
        it('should delay for the specified number of milliseconds', async () => {
            const startTime = Date.now();
            await RetryUtility.delay(100);
            const endTime = Date.now();
            const elapsed = endTime - startTime;

            expect(elapsed).toBeGreaterThanOrEqual(90); // Allow some margin
            expect(elapsed).toBeLessThan(150);
        });
    });

    describe('delay with an AbortSignal', () => {
        it('rejects with the abort reason as soon as the signal fires', async () => {
            const controller = new AbortController();
            const reason = new Error('budget expired');
            const startTime = Date.now();

            const delay = RetryUtility.delay(10000, controller.signal);
            setTimeout(() => controller.abort(reason), 20);

            await expect(delay).rejects.toBe(reason);
            expect(Date.now() - startTime).toBeLessThan(1000);
        });

        it('rejects immediately for an aborted signal', async () => {
            const controller = new AbortController();
            controller.abort(new Error('already aborted'));

            await expect(RetryUtility.delay(10000, controller.signal)).rejects.toThrow('already aborted');
        });

        it('resolves normally when the signal does not fire', async () => {
            await expect(RetryUtility.delay(10, new AbortController().signal)).resolves.toBeUndefined();
        });
    });

    describe('executeWithRetry with a retry predicate', () => {
        it('rethrows immediately when the predicate rejects the error', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('deterministic'));

            await expect(RetryUtility.executeWithRetry(operation, 'test operation', 5, 1, () => false)).rejects.toThrow(
                'deterministic',
            );
            expect(operation).toHaveBeenCalledTimes(1);
        });
    });

    describe('executeDatabaseOperation', () => {
        beforeEach(() => {
            jest.spyOn(RetryUtility, 'delay').mockResolvedValue(undefined);
        });

        it('retries a deadlock once', async () => {
            const operation = jest
                .fn()
                .mockRejectedValueOnce(Object.assign(new Error('Deadlock found'), { code: 'ER_LOCK_DEADLOCK' }))
                .mockResolvedValueOnce('ok');

            await expect(RetryUtility.executeDatabaseOperation(operation, 'save')).resolves.toBe('ok');
            expect(operation).toHaveBeenCalledTimes(2);
        });

        it('gives up after one retry', async () => {
            const lost = Object.assign(new Error('Connection lost'), { code: 'PROTOCOL_CONNECTION_LOST' });
            const operation = jest.fn().mockRejectedValue(lost);

            await expect(RetryUtility.executeDatabaseOperation(operation, 'save')).rejects.toBe(lost);
            expect(operation).toHaveBeenCalledTimes(2);
        });

        it.each([
            { name: 'foreign key violation', code: 'ER_NO_REFERENCED_ROW_2' },
            { name: 'duplicate entry', code: 'ER_DUP_ENTRY' },
            { name: 'data too long', code: 'ER_DATA_TOO_LONG' },
        ])('does not retry a $name', async ({ code }) => {
            const operation = jest.fn().mockRejectedValue({ driverError: { code }, message: code });

            await expect(RetryUtility.executeDatabaseOperation(operation, 'save')).rejects.toBeDefined();
            expect(operation).toHaveBeenCalledTimes(1);
        });
    });

    describe('executeWithRetry', () => {
        it('should execute operation successfully on first attempt', async () => {
            const mockOperation = jest.fn().mockResolvedValue('success');

            const result = await RetryUtility.executeWithRetry(mockOperation, 'test operation');

            expect(result).toBe('success');
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });

        it('should retry on failure and eventually succeed', async () => {
            const mockOperation = jest
                .fn()
                .mockRejectedValueOnce(new Error('fail 1'))
                .mockRejectedValueOnce(new Error('fail 2'))
                .mockResolvedValue('success');

            const result = await RetryUtility.executeWithRetry(mockOperation, 'test operation', 5, 10);

            expect(result).toBe('success');
            expect(mockOperation).toHaveBeenCalledTimes(3);
            expect(console.log).toHaveBeenCalledWith('✅ test operation succeeded on attempt 3');
        });

        it('should throw error after all retries exhausted', async () => {
            const mockOperation = jest.fn().mockRejectedValue(new Error('persistent error'));

            await expect(RetryUtility.executeWithRetry(mockOperation, 'test operation', 3, 10)).rejects.toThrow(
                'persistent error',
            );

            expect(mockOperation).toHaveBeenCalledTimes(3);
            expect(console.error).toHaveBeenCalledWith('❌ test operation failed after 3 attempts: persistent error');
        });

        it('should use default retry values', async () => {
            const mockOperation = jest.fn().mockResolvedValue('success');

            const result = await RetryUtility.executeWithRetry(mockOperation, 'test operation');

            expect(result).toBe('success');
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });
    });
});
