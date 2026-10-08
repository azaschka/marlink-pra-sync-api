import { AsyncLocalStorage } from 'async_hooks';

export interface ScanContextData {
    readonly scanId: string;
    readonly tenantId: number;
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
     *
     * An additional signal (application shutdown) aborts the scan as well; when it has already fired, the scan
     * starts aborted. Its listener is removed once the scan is over (deadline or abort), so a long-lived
     * signal does not collect one listener per scan.
     */
    public static runWithBudget<T>(
        scan: { scanId: string; tenantId: number; budgetInMs: number; signal?: AbortSignal },
        operation: () => Promise<T>,
    ): Promise<T> {
        if (ScanContext.current()) {
            return operation();
        }

        const controller = new AbortController();
        const parent = scan.signal;
        const end = () => {
            clearTimeout(timer);
            parent?.removeEventListener('abort', end);
            controller.abort(new ScanAbortedError(scan.scanId));
        };
        const timer = setTimeout(end, scan.budgetInMs);
        timer.unref();

        if (parent?.aborted) {
            end();
        } else {
            parent?.addEventListener('abort', end, { once: true });
        }

        return ScanContext.STORAGE.run(
            { scanId: scan.scanId, tenantId: scan.tenantId, signal: controller.signal },
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
