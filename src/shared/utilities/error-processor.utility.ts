import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError, HttpStatusCode } from 'axios';

export abstract class ErrorProcessorUtility {
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
}
