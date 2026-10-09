import { DatabaseConnectionUtility } from './database-connection.utility';

/**
 * Utility class for implementing retry logic and delays in async operations.
 * BeyondTrust calls are retried only in HttpClientService (BtRetryPolicy); this utility is meant for local
 * database operations.
 */
export class RetryUtility {
    public static readonly DEFAULT_MAX_RETRIES = 5;
    public static readonly DEFAULT_RETRY_DELAY_MS = 2000;

    // Database operations in scans and auto-sync: one retry, and only for transient errors.
    private static readonly DATABASE_MAX_ATTEMPTS = 2;
    private static readonly DATABASE_RETRY_DELAY_MS = 1000;

    /**
     * Delays execution for the specified number of milliseconds.
     *
     * @param ms - Delay in milliseconds
     * @param signal - Optional AbortSignal; the delay rejects with the abort reason as soon as it fires
     * @returns Promise that resolves after the delay
     */
    public static async delay(ms: number, signal?: AbortSignal): Promise<void> {
        if (!signal) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }

        signal.throwIfAborted();

        return new Promise((resolve, reject) => {
            const onAbort = () => {
                clearTimeout(timer);
                reject(signal.reason as Error);
            };
            const timer = setTimeout(() => {
                signal.removeEventListener('abort', onAbort);
                resolve();
            }, ms);

            signal.addEventListener('abort', onAbort, { once: true });
        });
    }

    /**
     * Executes a local database operation with at most one retry, and only when the failure is transient
     * (lost connection, deadlock, lock wait timeout). Deterministic failures such as foreign key violations
     * fail immediately.
     */
    public static executeDatabaseOperation<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
        return RetryUtility.executeWithRetry(
            operation,
            operationName,
            RetryUtility.DATABASE_MAX_ATTEMPTS,
            RetryUtility.DATABASE_RETRY_DELAY_MS,
            (error) => DatabaseConnectionUtility.isRetryableDatabaseError(error),
        );
    }

    /**
     * Executes an async operation with retry logic and delay between attempts.
     *
     * @param operation - The async operation to execute
     * @param operationName - Name of the operation for logging
     * @param maxRetries - Maximum number of retry attempts (default: 5)
     * @param delayMs - Delay in milliseconds between retry attempts (default: 2000ms)
     * @param shouldRetry - Optional predicate; errors for which it returns false are rethrown immediately
     * @returns The result of the operation
     * @throws The last error if all retry attempts fail
     */
    public static async executeWithRetry<T>(
        operation: () => Promise<T>,
        operationName: string,
        maxRetries: number = RetryUtility.DEFAULT_MAX_RETRIES,
        delayMs: number = RetryUtility.DEFAULT_RETRY_DELAY_MS,
        shouldRetry?: (error: unknown) => boolean,
    ): Promise<T> {
        let lastError: unknown;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await operation();
                if (attempt > 1) {
                    console.log(`✅ ${operationName} succeeded on attempt ${attempt}`);
                }
                return result;
            } catch (error) {
                lastError = error;
                const errorMessage = error instanceof Error ? error.message : String(error);

                if (shouldRetry && !shouldRetry(error)) {
                    console.error(`❌ ${operationName} failed (not retryable): ${errorMessage}`);
                    throw error;
                }

                console.warn(`⚠️ ${operationName} failed on attempt ${attempt}/${maxRetries}: ${errorMessage}`);

                if (attempt < maxRetries) {
                    console.log(`⏳ Retrying in ${delayMs}ms...`);
                    await RetryUtility.delay(delayMs);
                }
            }
        }

        // All retries exhausted
        const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
        console.error(`❌ ${operationName} failed after ${maxRetries} attempts: ${errorMessage}`);
        throw lastError;
    }
}
