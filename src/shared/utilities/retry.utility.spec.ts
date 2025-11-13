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
