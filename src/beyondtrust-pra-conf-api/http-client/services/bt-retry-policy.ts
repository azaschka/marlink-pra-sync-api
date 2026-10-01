import { BtApiError, BtApiErrorKind } from '../errors/bt-api-error';

export interface BtRetryOptions {
    /** Retries after the first attempt; 3 gives at most 4 attempts per request. */
    readonly maxRetries: number;
    /** First backoff delay; doubled per retry (1 s, 2 s, 4 s with the default). */
    readonly baseDelayInMs: number;
    /** Retry-After values above this limit are not waited for; the request fails instead. */
    readonly maxRetryAfterInMs: number;
}

export interface BtRetryState {
    retries: number;
    serverErrorRetries: number;
    unauthorizedRetries: number;
}

export interface BtRetryDecision {
    readonly retry: boolean;
    readonly delayInMs: number;
    /** The cached token has to be dropped before the next attempt. */
    readonly refreshToken: boolean;
}

/**
 * The only retry layer for BeyondTrust calls.
 *
 * Reads (GET, DELETE): Transient, ProxyConnectFailure, RateLimited and UnexpectedResponse with a 5xx status
 * are retried with exponential backoff plus jitter; ServerError once; Unauthorized once after a token
 * refresh. NotFound, ClientError and Cancelled are never retried.
 *
 * Writes (POST, PATCH, PUT): only retried when BeyondTrust provably did not process the request (proxy connect
 * failure, connect-phase network error, 429, 401). Any other failure may have been processed and is
 * marked as an ambiguous outcome instead of being repeated.
 */
export class BtRetryPolicy {
    private static readonly READ_METHODS: ReadonlySet<string> = new Set(['GET', 'DELETE', 'HEAD']);
    private static readonly JITTER_RATIO = 0.2;
    private static readonly NO_RETRY: BtRetryDecision = { retry: false, delayInMs: 0, refreshToken: false };

    constructor(
        private readonly options: BtRetryOptions,
        private readonly random: () => number = Math.random,
    ) {}

    public static initialState(): BtRetryState {
        return { retries: 0, serverErrorRetries: 0, unauthorizedRetries: 0 };
    }

    /** Decides about the next attempt and updates the state. Marks ambiguous write outcomes on the error. */
    public decide(error: BtApiError, state: BtRetryState): BtRetryDecision {
        const isRead = BtRetryPolicy.READ_METHODS.has(error.method.toUpperCase());

        if (!isRead && !error.notSent && BtRetryPolicy.mayHaveBeenProcessed(error.kind)) {
            error.ambiguousWriteOutcome = true;
        }

        if (state.retries >= this.options.maxRetries) {
            return BtRetryPolicy.NO_RETRY;
        }

        const decision = this.decideWithinBudget(error, state, isRead);

        if (decision.retry) {
            state.retries++;
        }

        return decision;
    }

    private decideWithinBudget(error: BtApiError, state: BtRetryState, isRead: boolean): BtRetryDecision {
        switch (error.kind) {
            case BtApiErrorKind.Unauthorized:
                if (state.unauthorizedRetries >= 1) {
                    return BtRetryPolicy.NO_RETRY;
                }
                state.unauthorizedRetries++;

                return { retry: true, delayInMs: 0, refreshToken: true };

            case BtApiErrorKind.RateLimited:
                return this.rateLimited(error, state);

            case BtApiErrorKind.ProxyConnectFailure:
                return this.backoff(state);

            case BtApiErrorKind.Transient:
                return isRead || error.notSent ? this.backoff(state) : BtRetryPolicy.NO_RETRY;

            case BtApiErrorKind.UnexpectedResponse:
                return isRead && (error.httpStatus ?? 0) >= 500 ? this.backoff(state) : BtRetryPolicy.NO_RETRY;

            case BtApiErrorKind.ServerError:
                if (!isRead || state.serverErrorRetries >= 1) {
                    return BtRetryPolicy.NO_RETRY;
                }
                state.serverErrorRetries++;

                return this.backoff(state);

            default:
                return BtRetryPolicy.NO_RETRY;
        }
    }

    private rateLimited(error: BtApiError, state: BtRetryState): BtRetryDecision {
        if (error.retryAfterInMs === undefined) {
            return this.backoff(state);
        }

        if (error.retryAfterInMs > this.options.maxRetryAfterInMs) {
            return BtRetryPolicy.NO_RETRY;
        }

        return { retry: true, delayInMs: error.retryAfterInMs, refreshToken: false };
    }

    private backoff(state: BtRetryState): BtRetryDecision {
        const delay = this.options.baseDelayInMs * 2 ** state.retries;
        const jitter = Math.round(delay * BtRetryPolicy.JITTER_RATIO * this.random());

        return { retry: true, delayInMs: delay + jitter, refreshToken: false };
    }

    private static mayHaveBeenProcessed(kind: BtApiErrorKind): boolean {
        return (
            kind === BtApiErrorKind.Transient ||
            kind === BtApiErrorKind.UnexpectedResponse ||
            kind === BtApiErrorKind.ServerError ||
            kind === BtApiErrorKind.Cancelled
        );
    }
}
