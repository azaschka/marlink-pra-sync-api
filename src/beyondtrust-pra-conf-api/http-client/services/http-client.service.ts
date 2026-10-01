import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AxiosError, AxiosResponse, Method, ResponseType } from 'axios';
import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { createWriteStream } from 'fs';
import { rename, unlink } from 'fs/promises';
import { firstValueFrom } from 'rxjs';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { BeyondtrustInstance } from '../../../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstanceByIdQuery } from '../../../beyondtrust-instance/queries';
import { ScanContext } from '../../../shared/context/scan-context';
import { IdleTimeoutStreamUtility, RetryUtility, UrlUtility } from '../../../shared/utilities';
import { AuthTokenService } from '../../auth/services/auth-token.service';
import { BtApiError, BtApiErrorKind } from '../errors/bt-api-error';
import { BtErrorClassifier } from '../errors/bt-error-classifier';
import { BtRetryPolicy } from './bt-retry-policy';

interface BtRequest {
    readonly method: Method;
    readonly urlPath: string;
    readonly params?: unknown;
    readonly data?: unknown;
    /** Overrides the client timeout (3 minutes) for this request. */
    readonly timeoutInMs?: number;
    readonly responseType?: ResponseType;
}

/**
 * Client for the BeyondTrust configuration API. Owns the only retry layer (BtRetryPolicy) and turns every
 * failure into a classified BtApiError. Log output per failure is one bounded line (BtApiError.describe()).
 *
 * Inside a scan (ScanContext) the scan's AbortSignal is passed to axios and to the retry delay, so an
 * expired scan budget aborts the in-flight request and prevents further attempts.
 */
@Injectable()
export class HttpClientService {
    private static readonly TOKEN_PATH = 'OAuth2 token endpoint';

    private readonly logger = new Logger('BeyondTrustApi');

    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpService: HttpService,
        private readonly authTokenService: AuthTokenService,
        private readonly queryBus: QueryBus,
    ) {}

    public async get<C, O>(
        cls: ClassConstructor<C>,
        transactionId: string,
        beyondtrustInstanceId: number,
        urlPath: string,
        params?: unknown,
    ): Promise<O> {
        const beyondtrustInstance = await this.getBeyondtrustInstance(transactionId, beyondtrustInstanceId);

        const response = await this.execute<O>(beyondtrustInstance, {
            method: 'GET',
            urlPath,
            params: instanceToPlain(params),
            timeoutInMs: this.appConfigService.beyondTrust.api.communication.readTimeoutInMs,
        });

        return plainToInstance(cls, response.data) as unknown as O;
    }

    public async post<C, O>(
        cls: ClassConstructor<C>,
        transactionId: string,
        beyondtrustInstanceId: number,
        urlPath: string,
        body?: unknown,
    ): Promise<O> {
        const beyondtrustInstance = await this.getBeyondtrustInstance(transactionId, beyondtrustInstanceId);

        const response = await this.execute<O>(beyondtrustInstance, {
            method: 'POST',
            urlPath,
            data: instanceToPlain(body),
        });

        return plainToInstance(cls, response.data) as unknown as O;
    }

    public async patch<C, O>(
        cls: ClassConstructor<C>,
        transactionId: string,
        beyondtrustInstanceId: number,
        urlPath: string,
        body?: unknown,
    ): Promise<O> {
        const beyondtrustInstance = await this.getBeyondtrustInstance(transactionId, beyondtrustInstanceId);

        const response = await this.execute<O>(beyondtrustInstance, {
            method: 'PATCH',
            urlPath,
            data: instanceToPlain(body),
        });

        return plainToInstance(cls, response.data) as unknown as O;
    }

    public async delete(
        transactionId: string,
        beyondtrustInstanceId: number,
        urlPath: string,
        params?: unknown,
    ): Promise<void> {
        const beyondtrustInstance = await this.getBeyondtrustInstance(transactionId, beyondtrustInstanceId);

        await this.execute(beyondtrustInstance, { method: 'DELETE', urlPath, params: instanceToPlain(params) });
    }

    /**
     * Binary POST whose response is streamed byte-for-byte into targetFilePath (BeyondTrust backup). Memory stays
     * bounded: the body goes through a temporary file next to the target, which is renamed atomically after the
     * complete body arrived (size checked against Content-Length) and removed on any failure. A body that makes
     * no progress for bodyIdleTimeoutInMs fails. Retried like any write: only when BeyondTrust provably did not
     * process the request.
     */
    public async postToFile(
        transactionId: string,
        beyondtrustInstanceId: number,
        urlPath: string,
        body: unknown,
        targetFilePath: string,
    ): Promise<{ bytes: number }> {
        const beyondtrustInstance = await this.getBeyondtrustInstance(transactionId, beyondtrustInstanceId);
        const response = await this.execute<Readable>(beyondtrustInstance, {
            method: 'POST',
            urlPath,
            data: instanceToPlain(body),
            responseType: 'stream',
        });
        const temporaryFilePath = `${targetFilePath}.${randomUUID()}.part`;
        let bytes = 0;
        const counter = new Transform({
            transform(chunk: Buffer, _encoding, callback) {
                bytes += chunk.length;
                callback(null, chunk);
            },
        });

        try {
            await pipeline(
                response.data,
                IdleTimeoutStreamUtility.create(
                    this.appConfigService.beyondTrust.api.communication.bodyIdleTimeoutInMs,
                    'backup download',
                ),
                counter,
                createWriteStream(temporaryFilePath, { flags: 'wx' }),
            );
            const expectedBytes = HttpClientService.expectedBytes(response);

            if (expectedBytes !== undefined && expectedBytes !== bytes) {
                throw new Error(`incomplete download: ${bytes} of ${expectedBytes} bytes`);
            }

            await rename(temporaryFilePath, targetFilePath);

            return { bytes };
        } catch (rawError) {
            response.data.destroy();
            await unlink(temporaryFilePath).catch(() => undefined);
            const error = BtErrorClassifier.classify(rawError, {
                method: 'POST',
                path: urlPath,
                beyondtrustInstanceId: beyondtrustInstance.id,
                attempts: 1,
            });
            error.ambiguousWriteOutcome = true;
            this.reportFailure(error);

            throw error;
        }
    }

    /** Streamed download (installers). Not retried: a partially consumed stream cannot be repeated. */
    public async stream(
        transactionId: string,
        beyondtrustInstanceId: number,
        urlPath: string,
        params?: unknown,
    ): Promise<AxiosResponse<NodeJS.ReadableStream>> {
        const beyondtrustInstance = await this.getBeyondtrustInstance(transactionId, beyondtrustInstanceId);

        try {
            return await firstValueFrom(
                this.httpService.get<NodeJS.ReadableStream>(UrlUtility.join(beyondtrustInstance.apiBaseUrl, urlPath), {
                    headers: {
                        Authorization: `Bearer ${await this.getAccessToken(beyondtrustInstance)}`,
                    },
                    params: params ? instanceToPlain(params) : undefined,
                    responseType: 'stream',
                }),
            );
        } catch (rawError) {
            const error = BtErrorClassifier.classify(rawError, {
                method: 'GET',
                path: urlPath,
                beyondtrustInstanceId: beyondtrustInstance.id,
                attempts: 1,
            });
            this.reportFailure(error);

            throw error;
        }
    }

    private async execute<O>(beyondtrustInstance: BeyondtrustInstance, request: BtRequest): Promise<AxiosResponse<O>> {
        const communication = this.appConfigService.beyondTrust.api.communication;
        const policy = new BtRetryPolicy({
            maxRetries: communication.retryAttempts,
            baseDelayInMs: communication.retryDelayInMs,
            maxRetryAfterInMs: communication.maxRetryAfterInMs,
        });
        const state = BtRetryPolicy.initialState();
        const url = UrlUtility.join(beyondtrustInstance.apiBaseUrl, request.urlPath);
        const signal = ScanContext.current()?.signal;

        for (let attempt = 1; ; attempt++) {
            let phase: 'token' | 'request' = 'token';
            let usedAccessToken: string | undefined;

            try {
                signal?.throwIfAborted();
                usedAccessToken = await this.getAccessToken(beyondtrustInstance);
                const authorization = `Bearer ${usedAccessToken}`;
                phase = 'request';

                return await firstValueFrom(
                    this.httpService.request<O>({
                        method: request.method,
                        url,
                        params: request.params,
                        data: request.data,
                        timeout: request.timeoutInMs,
                        headers: { Authorization: authorization },
                        signal,
                        responseType: request.responseType,
                    }),
                );
            } catch (rawError) {
                // An error answer of a streamed request must be discarded, otherwise it holds the socket.
                ((rawError as AxiosError | undefined)?.response?.data as Readable | undefined)?.destroy?.();

                const error = BtErrorClassifier.classify(rawError, {
                    method: request.method,
                    path: phase === 'token' ? HttpClientService.TOKEN_PATH : request.urlPath,
                    beyondtrustInstanceId: beyondtrustInstance.id,
                    attempts: attempt,
                    aborted: signal?.aborted,
                });
                const decision = policy.decide(error, state);

                if (!decision.retry) {
                    this.reportFailure(error);

                    throw error;
                }

                this.logger.warn(
                    `${error.describe()}; retry ${state.retries}/${communication.retryAttempts} in ${decision.delayInMs} ms`,
                );

                if (decision.refreshToken) {
                    this.invalidateAccessToken(beyondtrustInstance, usedAccessToken);
                }

                await this.waitBeforeRetry(decision.delayInMs, signal, error);
            }
        }
    }

    private async waitBeforeRetry(delayInMs: number, signal: AbortSignal | undefined, error: BtApiError) {
        try {
            await RetryUtility.delay(delayInMs, signal);
        } catch {
            // The scan budget expired while waiting: report the request as cancelled, without another attempt.
            const cancelled = BtErrorClassifier.classify(undefined, {
                method: error.method,
                path: error.path,
                beyondtrustInstanceId: error.beyondtrustInstanceId,
                attempts: error.attempts,
                aborted: true,
            });
            cancelled.ambiguousWriteOutcome = error.ambiguousWriteOutcome;
            this.reportFailure(cancelled);

            throw cancelled;
        }
    }

    // Content-Length counts the bytes on the wire; with a content encoding axios has decoded them already.
    private static expectedBytes(response: AxiosResponse): number | undefined {
        const encoding = String(response.headers['content-encoding'] ?? 'identity').toLowerCase();
        const length = Number(response.headers['content-length']);

        return encoding === 'identity' && Number.isInteger(length) && length >= 0 ? length : undefined;
    }

    // A JSON 404 is an expected answer for many callers (deleted entities, missing relation parents).
    private reportFailure(error: BtApiError): void {
        if (error.kind === BtApiErrorKind.NotFound) {
            this.logger.debug(error.describe());

            return;
        }

        if (error.kind === BtApiErrorKind.Cancelled) {
            this.logger.warn(error.describe());

            return;
        }

        this.logger.error(error.describe());
    }

    private async getBeyondtrustInstance(
        transactionId: string,
        beyondtrustInstanceId: number,
    ): Promise<BeyondtrustInstance> {
        const beyondtrustInstance = await this.queryBus.execute<
            RetrieveBeyondtrustInstanceByIdQuery,
            BeyondtrustInstance
        >(new RetrieveBeyondtrustInstanceByIdQuery(transactionId, beyondtrustInstanceId));

        return beyondtrustInstance;
    }

    private async getAccessToken(beyondtrustInstance: BeyondtrustInstance): Promise<string> {
        const authToken = await this.authTokenService.getAuthToken(
            beyondtrustInstance.id,
            beyondtrustInstance.authClientId,
            beyondtrustInstance.authClientSecret,
            beyondtrustInstance.oauth2TokenUrl,
        );

        return authToken.accessToken;
    }

    // Only drops the cached token if it is still the one the failing request used.
    private invalidateAccessToken(beyondtrustInstance: BeyondtrustInstance, usedAccessToken: string | undefined): void {
        this.authTokenService.invalidateAuthToken(
            beyondtrustInstance.id,
            beyondtrustInstance.authClientId,
            beyondtrustInstance.authClientSecret,
            beyondtrustInstance.oauth2TokenUrl,
            usedAccessToken,
        );
    }
}
