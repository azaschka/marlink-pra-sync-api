import { AxiosError, isCancel } from 'axios';
import { StreamIdleTimeoutError } from '../../../shared/utilities/idle-timeout-stream.utility';
import { BtApiError, BtApiErrorKind } from './bt-api-error';

export interface BtRequestContext {
    readonly method: string;
    readonly path: string;
    readonly beyondtrustInstanceId: number;
    readonly attempts: number;
    /** True when the caller's AbortSignal fired. */
    readonly aborted?: boolean;
    /**
     * True when the failure happened while the OAuth2 token was fetched. The BeyondTrust request itself was not
     * sent then (so it is never an ambiguous write), and a 404 means a wrong token URL, not a missing entity.
     */
    readonly tokenRequest?: boolean;
}

/**
 * Turns whatever a BeyondTrust call threw into a BtApiError with a kind that is derived from structured
 * signals (status, body type, error code, proxy header) instead of message substrings.
 */
export abstract class BtErrorClassifier {
    private static readonly JSON_MESSAGE_MAX_LENGTH = 300;
    private static readonly TEXT_SNIPPET_MAX_LENGTH = 120;

    private static readonly TRANSIENT_STATUSES: ReadonlySet<number> = new Set([408, 502, 503, 504]);
    private static readonly PROXY_CONNECT_FAILURE_STATUSES: ReadonlySet<number> = new Set([502, 503]);
    // Squid error codes that mean the proxy could not open a connection to BeyondTrust.
    private static readonly PROXY_CONNECT_FAILURE_PATTERN = /^ERR_(CONNECT_FAIL|DNS_FAIL|CANNOT_FORWARD)\b/;

    private static readonly TRANSIENT_CODES: ReadonlySet<string> = new Set([
        'ECONNRESET',
        'ETIMEDOUT',
        'ECONNABORTED',
        'ESOCKETTIMEDOUT',
        'EPIPE',
        'EAI_AGAIN',
        'ECONNREFUSED',
        'ENOTFOUND',
        'EHOSTUNREACH',
        'ENETUNREACH',
        'ERR_NETWORK',
    ]);
    // Failures while connecting: the request cannot have reached BeyondTrust.
    private static readonly NOT_SENT_CODES: ReadonlySet<string> = new Set([
        'ECONNREFUSED',
        'ENOTFOUND',
        'EAI_AGAIN',
        'EHOSTUNREACH',
        'ENETUNREACH',
    ]);
    private static readonly TRANSIENT_MESSAGE_PATTERN = /timeout|stream has been aborted|socket hang up/i;

    public static classify(error: unknown, context: BtRequestContext): BtApiError {
        if (error instanceof BtApiError) {
            return error;
        }

        if (context.aborted || isCancel(error) || (error as { code?: unknown } | undefined)?.code === 'ERR_CANCELED') {
            return BtErrorClassifier.create(context, {
                kind: BtApiErrorKind.Cancelled,
                code: 'ERR_CANCELED',
                snippet: 'request aborted',
                notSent: false,
            });
        }

        if (error instanceof StreamIdleTimeoutError) {
            return BtErrorClassifier.create(context, {
                kind: BtApiErrorKind.Transient,
                code: error.code,
                snippet: error.message,
                notSent: false,
            });
        }

        if (!(error instanceof AxiosError)) {
            return BtErrorClassifier.create(context, {
                kind: BtApiErrorKind.UnexpectedResponse,
                snippet: BtErrorClassifier.truncate(
                    error instanceof Error ? error.message : String(error),
                    BtErrorClassifier.TEXT_SNIPPET_MAX_LENGTH,
                ),
                notSent: false,
            });
        }

        if (!error.response) {
            return BtErrorClassifier.classifyWithoutResponse(error, context);
        }

        const status = error.response.status;
        const body = BtErrorClassifier.parseBody(error.response.data);
        const squidError = BtErrorClassifier.header(error.response.headers, 'x-squid-error');
        const retryAfterInMs = BtErrorClassifier.parseRetryAfter(
            BtErrorClassifier.header(error.response.headers, 'retry-after'),
        );
        const proxyConnectFailure =
            BtErrorClassifier.PROXY_CONNECT_FAILURE_STATUSES.has(status) &&
            !!squidError &&
            BtErrorClassifier.PROXY_CONNECT_FAILURE_PATTERN.test(squidError);

        const kind = BtErrorClassifier.kindForStatus(
            status,
            body.json !== undefined,
            proxyConnectFailure,
            context.tokenRequest === true,
        );

        return BtErrorClassifier.create(
            context,
            {
                kind,
                httpStatus: status,
                snippet: body.snippet,
                squidError,
                retryAfterInMs,
                // 401 and 429 are rejections, a proxy connect failure never reached BeyondTrust.
                notSent:
                    kind === BtApiErrorKind.ProxyConnectFailure ||
                    kind === BtApiErrorKind.Unauthorized ||
                    kind === BtApiErrorKind.RateLimited,
            },
            body.json,
        );
    }

    private static kindForStatus(
        status: number,
        isJson: boolean,
        proxyConnectFailure: boolean,
        tokenRequest: boolean,
    ): BtApiErrorKind {
        if (status === 401) {
            return BtApiErrorKind.Unauthorized;
        }

        if (status === 429) {
            return BtApiErrorKind.RateLimited;
        }

        if (proxyConnectFailure) {
            return BtApiErrorKind.ProxyConnectFailure;
        }

        // BeyondTrust answers errors with JSON; anything else comes from a proxy or ingress in between.
        if (!isJson) {
            return BtApiErrorKind.UnexpectedResponse;
        }

        if (status === 404) {
            // A missing token endpoint is a configuration error; it must not read as "entity not found".
            return tokenRequest ? BtApiErrorKind.ClientError : BtApiErrorKind.NotFound;
        }

        if (BtErrorClassifier.TRANSIENT_STATUSES.has(status)) {
            return BtApiErrorKind.Transient;
        }

        if (status >= 500) {
            return BtApiErrorKind.ServerError;
        }

        if (status >= 400) {
            return BtApiErrorKind.ClientError;
        }

        return BtApiErrorKind.UnexpectedResponse;
    }

    private static classifyWithoutResponse(error: AxiosError, context: BtRequestContext): BtApiError {
        const code = typeof error.code === 'string' ? error.code : undefined;
        const transient =
            (code !== undefined && BtErrorClassifier.TRANSIENT_CODES.has(code)) ||
            BtErrorClassifier.TRANSIENT_MESSAGE_PATTERN.test(error.message);

        return BtErrorClassifier.create(context, {
            kind: transient ? BtApiErrorKind.Transient : BtApiErrorKind.UnexpectedResponse,
            code,
            snippet: BtErrorClassifier.truncate(error.message, BtErrorClassifier.TEXT_SNIPPET_MAX_LENGTH),
            notSent: code !== undefined && BtErrorClassifier.NOT_SENT_CODES.has(code),
        });
    }

    private static create(
        context: BtRequestContext,
        details: {
            kind: BtApiErrorKind;
            snippet: string;
            notSent: boolean;
            httpStatus?: number;
            code?: string;
            squidError?: string;
            retryAfterInMs?: number;
        },
        json?: Record<string, unknown>,
    ): BtApiError {
        return new BtApiError(
            {
                method: context.method,
                path: context.path,
                beyondtrustInstanceId: context.beyondtrustInstanceId,
                attempts: context.attempts,
                ...details,
                notSent: details.notSent || context.tokenRequest === true,
            },
            json,
        );
    }

    /** Returns the JSON object (if the body is one) and a bounded snippet; never the whole body. */
    private static parseBody(data: unknown): { json?: Record<string, unknown>; snippet: string } {
        let value: unknown = data;

        if (Buffer.isBuffer(value)) {
            value = value.toString('utf8');
        }

        if (typeof value === 'string') {
            const trimmed = value.trim();

            if (trimmed.startsWith('{')) {
                try {
                    value = JSON.parse(trimmed) as unknown;
                } catch {
                    // not JSON, handled as text below
                }
            }
        }

        if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value) &&
            !BtErrorClassifier.isStream(value)
        ) {
            const json = value as Record<string, unknown>;
            const message = [json.message, json.error_description, json.error].find(
                (candidate): candidate is string => typeof candidate === 'string',
            );

            return {
                json,
                snippet: message ? BtErrorClassifier.truncate(message, BtErrorClassifier.JSON_MESSAGE_MAX_LENGTH) : '',
            };
        }

        if (typeof value === 'string') {
            return { snippet: BtErrorClassifier.textSnippet(value) };
        }

        return { snippet: '' };
    }

    private static textSnippet(text: string): string {
        if (/<html|<!doctype/i.test(text)) {
            const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(text)?.[1];

            return title
                ? `HTML page "${BtErrorClassifier.truncate(BtErrorClassifier.collapse(title), BtErrorClassifier.TEXT_SNIPPET_MAX_LENGTH)}"`
                : 'HTML page';
        }

        return BtErrorClassifier.truncate(BtErrorClassifier.collapse(text), BtErrorClassifier.TEXT_SNIPPET_MAX_LENGTH);
    }

    private static header(headers: unknown, name: string): string | undefined {
        if (!headers || typeof headers !== 'object') {
            return undefined;
        }

        const getter = (headers as { get?: (key: string) => unknown }).get;
        const value =
            typeof getter === 'function'
                ? getter.call(headers, name)
                : ((headers as Record<string, unknown>)[name] ??
                  Object.entries(headers as Record<string, unknown>).find(([key]) => key.toLowerCase() === name)?.[1]);

        if (Array.isArray(value)) {
            return typeof value[0] === 'string' ? value[0] : undefined;
        }

        return typeof value === 'string' && value.length > 0 ? value : undefined;
    }

    private static parseRetryAfter(value: string | undefined): number | undefined {
        if (!value) {
            return undefined;
        }

        if (/^\d+$/.test(value.trim())) {
            return Number(value.trim()) * 1000;
        }

        const date = Date.parse(value);

        return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
    }

    private static isStream(value: object): boolean {
        return typeof (value as { pipe?: unknown }).pipe === 'function';
    }

    private static collapse(text: string): string {
        return text.replace(/\s+/g, ' ').trim();
    }

    private static truncate(text: string, maxLength: number): string {
        return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
    }
}
