import { HttpException, HttpStatus } from '@nestjs/common';

/** Why a BeyondTrust request failed. Decides about retries, scan outcomes and log output. */
export enum BtApiErrorKind {
    /** HTTP 404 with a JSON body from BeyondTrust. */
    NotFound = 'NotFound',
    /** An error body that is not JSON, e.g. an HTML 404 or 503 page from a proxy or ingress. */
    UnexpectedResponse = 'UnexpectedResponse',
    Unauthorized = 'Unauthorized',
    RateLimited = 'RateLimited',
    /** The forward proxy could not connect to BeyondTrust; the request provably did not reach it. */
    ProxyConnectFailure = 'ProxyConnectFailure',
    /** 502, 503, 504, 408, connection resets, timeouts, DNS and connect failures. */
    Transient = 'Transient',
    /** 500 and other 5xx with a JSON body. */
    ServerError = 'ServerError',
    /** Other 4xx (400, 403, 409, 422). */
    ClientError = 'ClientError',
    /** The request was aborted, e.g. because the scan budget expired. */
    Cancelled = 'Cancelled',
}

export interface BtApiErrorDetails {
    readonly kind: BtApiErrorKind;
    readonly method: string;
    /** Path relative to the API base URL, without query string. */
    readonly path: string;
    readonly beyondtrustInstanceId: number;
    readonly attempts: number;
    /** HTTP status of the response, if there was one. */
    readonly httpStatus?: number;
    /** Network or axios error code, e.g. ECONNRESET. */
    readonly code?: string;
    /** Bounded, sanitized description of the response: JSON message, HTML title or error message. */
    readonly snippet: string;
    /** Value of the X-Squid-Error header, if present. */
    readonly squidError?: string;
    /** Delay requested by Retry-After, if present and parseable. */
    readonly retryAfterInMs?: number;
    /** True when the request failed before it could have reached BeyondTrust. */
    readonly notSent: boolean;
}

/**
 * Error of a BeyondTrust API call after classification.
 *
 * Extends HttpException so that existing callers keep working: getStatus() is the BeyondTrust status
 * (500 without a response, as before), getResponse() is the BeyondTrust JSON body, or a short summary
 * when the body was not JSON (it used to be the complete HTML page).
 */
export class BtApiError extends HttpException {
    public readonly kind: BtApiErrorKind;
    public readonly method: string;
    public readonly path: string;
    public readonly beyondtrustInstanceId: number;
    public readonly httpStatus?: number;
    public readonly code?: string;
    public readonly snippet: string;
    public readonly squidError?: string;
    public readonly retryAfterInMs?: number;
    public readonly notSent: boolean;
    public attempts: number;
    /** Set for a write that failed after it may have reached BeyondTrust; it is never repeated automatically. */
    public ambiguousWriteOutcome = false;
    /** Set when an earlier attempt of the same request failed after it may have reached BeyondTrust. */
    public earlierAttemptMayHaveSucceeded = false;

    constructor(details: BtApiErrorDetails, jsonBody?: Record<string, unknown>) {
        super(
            jsonBody ?? BtApiError.summarize(details),
            details.httpStatus ?? Number(HttpStatus.INTERNAL_SERVER_ERROR),
        );
        this.kind = details.kind;
        this.method = details.method;
        this.path = details.path;
        this.beyondtrustInstanceId = details.beyondtrustInstanceId;
        this.attempts = details.attempts;
        this.httpStatus = details.httpStatus;
        this.code = details.code;
        this.snippet = details.snippet;
        this.squidError = details.squidError;
        this.retryAfterInMs = details.retryAfterInMs;
        this.notSent = details.notSent;
    }

    /** One bounded line for logs. Never contains headers (except X-Squid-Error), tokens or request bodies. */
    public describe(): string {
        return [
            `BeyondTrust ${this.method} ${this.path}`,
            `instance ${this.beyondtrustInstanceId}`,
            this.httpStatus !== undefined ? `status ${this.httpStatus}` : undefined,
            this.code ? `code ${this.code}` : undefined,
            `kind ${this.kind}`,
            `attempts ${this.attempts}`,
            this.ambiguousWriteOutcome ? 'outcome unknown, not repeated' : undefined,
            this.squidError ? `squid ${this.squidError}` : undefined,
            this.snippet ? `"${this.snippet}"` : undefined,
        ]
            .filter(Boolean)
            .join(', ');
    }

    private static summarize(details: BtApiErrorDetails): string {
        const status = details.httpStatus !== undefined ? ` with status ${details.httpStatus}` : '';

        return `BeyondTrust ${details.method} ${details.path} failed${status} (${details.kind})${
            details.snippet ? `: ${details.snippet}` : ''
        }`;
    }
}
