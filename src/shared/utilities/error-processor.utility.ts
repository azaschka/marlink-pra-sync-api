import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError, HttpStatusCode } from 'axios';
import { BtApiError, BtApiErrorKind } from '../../beyondtrust-pra-conf-api/http-client/errors/bt-api-error';

export abstract class ErrorProcessorUtility {
    private static readonly CONNECTIVITY_KINDS: ReadonlySet<BtApiErrorKind> = new Set([
        BtApiErrorKind.Transient,
        BtApiErrorKind.ProxyConnectFailure,
        BtApiErrorKind.UnexpectedResponse,
        BtApiErrorKind.RateLimited,
    ]);

    public static stringify(error: unknown): string {
        if (error instanceof Error) {
            return error.stack ?? error.message;
        }

        try {
            return JSON.stringify(error);
        } catch {
            return String(error);
        }
    }

    public static composeError(error: unknown) {
        if (error instanceof AxiosError) {
            return new HttpException(
                error.response?.data ? (error.response?.data as Record<string, unknown>) : error.message,
                error.response?.status || HttpStatusCode.InternalServerError,
            );
        }

        return new HttpException(JSON.stringify(error), HttpStatusCode.InternalServerError);
    }

    /**
     * Returns true when the error is an HTTP 422 (Unprocessable Entity) from BeyondTrust.
     *
     * BeyondTrust uses this status code as its standard response when a resource with the given
     * name or identifier already exists. Handlers that receive this error should attempt to fetch
     * the existing resource from BeyondTrust and upsert it locally (self-healing / idempotency).
     * If the resource cannot be found after receiving a 422, the original error must be re-thrown
     * so callers still receive the proper validation response.
     *
     * Deliberately checks status code only — not the error message text — because BeyondTrust
     * may phrase the validation message differently across entity types and API versions.
     */
    public static isBeyondTrustUnprocessableEntityError(error: unknown): boolean {
        return error instanceof HttpException && (error.getStatus() as HttpStatus) === HttpStatus.UNPROCESSABLE_ENTITY;
    }

    /**
     * Check if an error is related to API or database connectivity issues (timeouts, connection resets, server errors).
     * Used to determine if an operation should be gracefully skipped vs. thrown as a critical error.
     *
     * Covers:
     * - API timeouts and connectivity issues (timeout, ECONNRESET, ENOTFOUND, 502, 503, 504)
     * - Database timeouts (ETIMEDOUT, QueryFailedError with timeout)
     */
    public static isApiConnectivityError(error: unknown): boolean {
        // Classified BeyondTrust errors are judged by their kind, not by their message text.
        if (error instanceof BtApiError) {
            return ErrorProcessorUtility.CONNECTIVITY_KINDS.has(error.kind);
        }

        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorString = String(error); // Full error string including stack

        return (
            errorMessage.includes('timeout') ||
            errorMessage.includes('ETIMEDOUT') ||
            errorMessage.includes('ECONNRESET') ||
            errorMessage.includes('ENOTFOUND') ||
            errorMessage.includes('502') ||
            errorMessage.includes('503') ||
            errorMessage.includes('504') ||
            errorString.includes('QueryFailedError') ||
            errorString.includes('read ETIMEDOUT')
        );
    }
}
