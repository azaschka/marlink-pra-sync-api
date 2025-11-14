import { HttpException } from '@nestjs/common';
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
     * Check if an error is related to API or database connectivity issues (timeouts, connection resets, server errors).
     * Used to determine if an operation should be gracefully skipped vs. thrown as a critical error.
     *
     * Covers:
     * - API timeouts and connectivity issues (timeout, ECONNRESET, ENOTFOUND, 502, 503, 504)
     * - Database timeouts (ETIMEDOUT, QueryFailedError with timeout)
     */
    public static isApiConnectivityError(error: unknown): boolean {
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
