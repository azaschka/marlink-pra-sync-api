import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError, AxiosResponse, HttpStatusCode } from 'axios';
import { BtApiError, BtApiErrorKind } from '../../beyondtrust-pra-conf-api/http-client/errors/bt-api-error';
import { ErrorProcessorUtility } from './error-processor.utility';

describe('ErrorProcessorUtility', () => {
    describe('stringify', () => {
        describe('not an error type', () => {
            it.each([
                {
                    input: 'An error occurred',
                    expectedOutput: '"An error occurred"',
                },
                {
                    input: { obj: 1, obj2: 'test' },
                    expectedOutput: '{"obj":1,"obj2":"test"}',
                },
            ])('should return as expected', ({ input, expectedOutput }) => {
                const result = ErrorProcessorUtility.stringify(input);

                expect(result).toEqual(expectedOutput);
            });
        });

        describe('error type', () => {
            it.each([
                {
                    input: new Error('An error occurred'),
                    expectedOutput: 'Error: An error occurred',
                },
                {
                    input: new Error('An error occurred', { cause: 'test' }),
                    expectedOutput: 'Error: An error occurred',
                },
                {
                    input: new TypeError('An error occurred'),
                    expectedOutput: 'TypeError: An error occurred',
                },
            ])('should return as expected', ({ input, expectedOutput }) => {
                const result = ErrorProcessorUtility.stringify(input);

                expect(result).toEqual(expect.stringContaining(expectedOutput));
            });
        });
    });

    describe('composeError', () => {
        it('should return HttpException with error message and status code from AxiosError', () => {
            const axiosError = new AxiosError('error-message', 'ERR_BAD_REQUEST', undefined, undefined, <AxiosResponse>{
                status: 400,
                data: { error: 'test' },
            });

            const result = ErrorProcessorUtility.composeError(axiosError);

            expect(result).toBeInstanceOf(HttpException);
            expect(result.getResponse()).toEqual({ error: 'test' });
            expect(result.getStatus()).toBe(400);
        });

        it('should return HttpException with stringified error for non-Axios errors', () => {
            const nonAxiosError = new Error('Non-Axios error occurred');

            const result = ErrorProcessorUtility.composeError(nonAxiosError);

            expect(result).toBeInstanceOf(HttpException);
            expect(result.getResponse()).toEqual(JSON.stringify(nonAxiosError));
            expect(result.getStatus()).toBe(HttpStatusCode.InternalServerError);
        });
    });

    describe('isBeyondTrustUnprocessableEntityError', () => {
        it('should return true for an HttpException with status 422', () => {
            const error = new HttpException({}, HttpStatus.UNPROCESSABLE_ENTITY);
            expect(ErrorProcessorUtility.isBeyondTrustUnprocessableEntityError(error)).toBe(true);
        });

        it('should return false for an HttpException with a different status (e.g. 409)', () => {
            const error = new HttpException('Conflict', HttpStatus.CONFLICT);
            expect(ErrorProcessorUtility.isBeyondTrustUnprocessableEntityError(error)).toBe(false);
        });

        it('should return false for a plain Error (not an HttpException)', () => {
            const error = new Error('Something went wrong');
            expect(ErrorProcessorUtility.isBeyondTrustUnprocessableEntityError(error)).toBe(false);
        });

        it('should return false for null', () => {
            expect(ErrorProcessorUtility.isBeyondTrustUnprocessableEntityError(null)).toBe(false);
        });

        it('should return false for a plain object', () => {
            expect(ErrorProcessorUtility.isBeyondTrustUnprocessableEntityError({ status: 422 })).toBe(false);
        });
    });

    describe('isApiConnectivityError', () => {
        it.each([
            { kind: BtApiErrorKind.Transient, expected: true },
            { kind: BtApiErrorKind.ProxyConnectFailure, expected: true },
            { kind: BtApiErrorKind.UnexpectedResponse, expected: true },
            { kind: BtApiErrorKind.RateLimited, expected: true },
            { kind: BtApiErrorKind.NotFound, expected: false },
            { kind: BtApiErrorKind.ClientError, expected: false },
            { kind: BtApiErrorKind.ServerError, expected: false },
            { kind: BtApiErrorKind.Unauthorized, expected: false },
            { kind: BtApiErrorKind.Cancelled, expected: false },
        ])('judges a classified BeyondTrust error of kind $kind by its kind ($expected)', ({ kind, expected }) => {
            // The snippet contains "503" and "timeout" on purpose: the message text must not decide.
            const error = new BtApiError({
                kind,
                method: 'GET',
                path: '/user',
                beyondtrustInstanceId: 1,
                attempts: 1,
                snippet: '503 timeout',
                notSent: false,
                httpStatus: 503,
            });

            expect(ErrorProcessorUtility.isApiConnectivityError(error)).toBe(expected);
        });

        it.each([
            { error: new Error('timeout'), expected: true, description: 'API timeout' },
            { error: new Error('ETIMEDOUT'), expected: true, description: 'Database ETIMEDOUT' },
            { error: new Error('read ETIMEDOUT'), expected: true, description: 'Database read ETIMEDOUT' },
            { error: new Error('ECONNRESET'), expected: true, description: 'Connection reset' },
            { error: new Error('ENOTFOUND'), expected: true, description: 'Host not found' },
            { error: new Error('502 Bad Gateway'), expected: true, description: '502 error' },
            { error: new Error('503 Service Unavailable'), expected: true, description: '503 error' },
            { error: new Error('504 Gateway Timeout'), expected: true, description: '504 error' },
            {
                error: new Error('QueryFailedError: read ETIMEDOUT'),
                expected: true,
                description: 'QueryFailedError',
            },
            { error: 'timeout string', expected: true, description: 'timeout as string' },
            { error: new Error('Invalid input'), expected: false, description: 'non-connectivity error' },
            { error: new Error('Database locked'), expected: false, description: 'different database error' },
        ])('should return $expected for $description', ({ error, expected }) => {
            const result = ErrorProcessorUtility.isApiConnectivityError(error);
            expect(result).toBe(expected);
        });

        it('should detect QueryFailedError from full error string', () => {
            const queryFailedError = {
                name: 'QueryFailedError',
                message: 'read ETIMEDOUT',
                toString: () => 'QueryFailedError: read ETIMEDOUT',
            };

            const result = ErrorProcessorUtility.isApiConnectivityError(queryFailedError);
            expect(result).toBe(true);
        });
    });
});
