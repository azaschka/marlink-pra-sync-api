import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AxiosResponse, Method } from 'axios';
import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { BeyondtrustInstance } from '../../../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstanceByIdQuery } from '../../../beyondtrust-instance/queries';
import { ScanContext } from '../../../shared/context/scan-context';
import { RetryUtility, UrlUtility } from '../../../shared/utilities';
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
                        Authorization: await this.getAuthHeader(beyondtrustInstance),
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

            try {
                signal?.throwIfAborted();
                const authorization = await this.getAuthHeader(beyondtrustInstance);
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
                    }),
                );
            } catch (rawError) {
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
                    this.invalidateAuthHeader(beyondtrustInstance);
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

    private async getAuthHeader(beyondtrustInstance: BeyondtrustInstance): Promise<string> {
        const authToken = await this.authTokenService.getAuthToken(
            beyondtrustInstance.id,
            beyondtrustInstance.authClientId,
            beyondtrustInstance.authClientSecret,
            beyondtrustInstance.oauth2TokenUrl,
        );

        return `Bearer ${authToken.accessToken}`;
    }

    private invalidateAuthHeader(beyondtrustInstance: BeyondtrustInstance): void {
        this.authTokenService.invalidateAuthToken(
            beyondtrustInstance.id,
            beyondtrustInstance.authClientId,
            beyondtrustInstance.authClientSecret,
            beyondtrustInstance.oauth2TokenUrl,
        );
    }
}
