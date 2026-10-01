import { AsyncLocalStorage } from 'async_hooks';

export interface ScanContextData {
    readonly scanId: string;
    readonly tenantId: number;
    /** Epoch milliseconds after which the scan is aborted. */
    readonly deadline: number;
    readonly signal: AbortSignal;
}

/** Thrown when work of a scan is not started or not finished because its time budget expired. */
export class ScanAbortedError extends Error {
    constructor(public readonly scanId: string) {
        super(`Scan ${scanId} was aborted because its time budget expired`);
        this.name = 'ScanAbortedError';
    }
}

/**
 * Carries the scan identity, deadline and AbortSignal through everything a scan triggers (commands, sagas,
 * event handlers, BeyondTrust requests) without passing them through every handler signature.
 * HttpClientService passes the signal to axios, so expiring the budget aborts in-flight requests.
 */
export abstract class ScanContext {
    private static readonly STORAGE = new AsyncLocalStorage<ScanContextData>();

    public static current(): ScanContextData | undefined {
        return ScanContext.STORAGE.getStore();
    }

    /**
     * Runs the operation with a time budget. Inside an existing scan context the operation joins that
     * context (and its budget) instead of starting a new one.
     *
     * The budget also bounds background work the operation started (relation scans, auto-sync), which keeps
     * the context after the operation returned. Therefore the timer is not cleared on return; it is unref'd
     * and fires once at the deadline.
     */
    public static runWithBudget<T>(
        scan: { scanId: string; tenantId: number; budgetInMs: number },
        operation: () => Promise<T>,
    ): Promise<T> {
        if (ScanContext.current()) {
            return operation();
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(new ScanAbortedError(scan.scanId)), scan.budgetInMs);
        timer.unref();

        return ScanContext.STORAGE.run(
            {
                scanId: scan.scanId,
                tenantId: scan.tenantId,
                deadline: Date.now() + scan.budgetInMs,
                signal: controller.signal,
            },
            operation,
        );
    }

    public static isAborted(): boolean {
        return ScanContext.current()?.signal.aborted ?? false;
    }

    /** Stops the current step when the budget of the surrounding scan has expired. */
    public static throwIfAborted(): void {
        const context = ScanContext.current();

        if (context?.signal.aborted) {
            throw new ScanAbortedError(context.scanId);
        }
    }
}
