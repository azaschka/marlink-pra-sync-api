import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AxiosError, AxiosResponse, HttpStatusCode } from 'axios';
import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer';
import { catchError, defer, firstValueFrom, map, retry, switchMap, throwError, timer } from 'rxjs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { BeyondtrustInstance } from '../../../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstanceByIdQuery } from '../../../beyondtrust-instance/queries';
import { UrlUtility } from '../../../shared/utilities';
import { ErrorProcessorUtility } from '../../../shared/utilities/error-processor.utility';
import { AuthTokenService } from '../../auth/services/auth-token.service';

@Injectable()
export class HttpClientService {
    private static readonly RETRYABLE_STATUS_CODES = [
        HttpStatusCode.Unauthorized,
        HttpStatusCode.RequestTimeout,
        HttpStatusCode.TooManyRequests,
        HttpStatusCode.BadGateway,
        HttpStatusCode.ServiceUnavailable,
        HttpStatusCode.GatewayTimeout,
    ];

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

        const result = await firstValueFrom(
            defer(async () =>
                this.httpService.get<O>(UrlUtility.join(beyondtrustInstance.apiBaseUrl, urlPath), {
                    headers: {
                        Authorization: await this.getAuthHeader(beyondtrustInstance),
                    },
                    params: instanceToPlain(params),
                }),
            ).pipe(
                // flatten the Observable<Observable<AxiosResponse>> into Observable<AxiosResponse>
                // using RxJS's `mergeMap` or `switchMap`
                switchMap((response) => response), // unwrap inner Observable
                catchError((error) => {
                    const errorDetails = this.formatAxiosError(error, 'GET', urlPath, beyondtrustInstance, params);
                    console.error(errorDetails);
                    throw error;
                }),
                retry({
                    count: this.appConfigService.beyondTrust.api.communication.retryAttempts,
                    delay: (error) => {
                        if (error instanceof AxiosError) {
                            if (error.status === HttpStatusCode.Unauthorized) {
                                this.invalidateAuthHeader(beyondtrustInstance); // token will refresh next attempt
                            }

                            if (error.status && HttpClientService.RETRYABLE_STATUS_CODES.includes(error.status)) {
                                return timer(this.appConfigService.beyondTrust.api.communication.retryDelayInMs);
                            }
                        }

                        throw error;
                    },
                }),
                map((response) => plainToInstance(cls, response.data)),
                catchError((error) => {
                    // Rethrow the error as a nestjs HttpException
                    throw ErrorProcessorUtility.composeError(error);
                }),
            ),
        );

        return result as O;
    }

    public async post<C, O>(
        cls: ClassConstructor<C>,
        transactionId: string,
        beyondtrustInstanceId: number,
        urlPath: string,
        body?: unknown,
    ): Promise<O> {
        const beyondtrustInstance = await this.getBeyondtrustInstance(transactionId, beyondtrustInstanceId);

        const result = await firstValueFrom(
            defer(async () =>
                this.httpService.post<O>(
                    UrlUtility.join(beyondtrustInstance.apiBaseUrl, urlPath),
                    instanceToPlain(body),
                    {
                        headers: {
                            Authorization: await this.getAuthHeader(beyondtrustInstance),
                        },
                    },
                ),
            ).pipe(
                switchMap((response) => response),
                catchError((error) => {
                    const errorDetails = this.formatAxiosError(
                        error,
                        'POST',
                        urlPath,
                        beyondtrustInstance,
                        undefined,
                        body,
                    );
                    console.error(errorDetails);
                    throw error;
                }),
                retry({
                    count: this.appConfigService.beyondTrust.api.communication.retryAttempts,
                    delay: (error) => {
                        if (error instanceof AxiosError) {
                            if (error.status === HttpStatusCode.Unauthorized) {
                                this.invalidateAuthHeader(beyondtrustInstance); // token will refresh next attempt
                            }

                            if (error.status && HttpClientService.RETRYABLE_STATUS_CODES.includes(error.status)) {
                                return timer(this.appConfigService.beyondTrust.api.communication.retryDelayInMs);
                            }
                        }

                        throw error;
                    },
                }),
                map((response) => plainToInstance(cls, response.data)),
                catchError((error) => {
                    // Rethrow the error as a nestjs HttpException
                    throw ErrorProcessorUtility.composeError(error);
                }),
            ),
        );

        return result as O;
    }

    public async patch<C, O>(
        cls: ClassConstructor<C>,
        transactionId: string,
        beyondtrustInstanceId: number,
        urlPath: string,
        body?: unknown,
    ): Promise<O> {
        const beyondtrustInstance = await this.getBeyondtrustInstance(transactionId, beyondtrustInstanceId);

        const result = await firstValueFrom(
            defer(async () =>
                this.httpService.patch<O>(
                    UrlUtility.join(beyondtrustInstance.apiBaseUrl, urlPath),
                    instanceToPlain(body),
                    {
                        headers: {
                            Authorization: await this.getAuthHeader(beyondtrustInstance),
                        },
                    },
                ),
            ).pipe(
                switchMap((response) => response),
                catchError((error) => {
                    const errorDetails = this.formatAxiosError(
                        error,
                        'PATCH',
                        urlPath,
                        beyondtrustInstance,
                        undefined,
                        body,
                    );
                    console.error(errorDetails);
                    throw error;
                }),
                retry({
                    count: this.appConfigService.beyondTrust.api.communication.retryAttempts,
                    delay: (error) => {
                        if (error instanceof AxiosError) {
                            if (error.status === HttpStatusCode.Unauthorized) {
                                this.invalidateAuthHeader(beyondtrustInstance); // token will refresh next attempt
                            }

                            if (error.status && HttpClientService.RETRYABLE_STATUS_CODES.includes(error.status)) {
                                return timer(this.appConfigService.beyondTrust.api.communication.retryDelayInMs);
                            }
                        }

                        throw error;
                    },
                }),
                map((response) => plainToInstance(cls, response.data)),
                catchError((error) => {
                    // Rethrow the error as a nestjs HttpException
                    throw ErrorProcessorUtility.composeError(error);
                }),
            ),
        );

        return result as O;
    }

    public async delete(
        transactionId: string,
        beyondtrustInstanceId: number,
        urlPath: string,
        params?: unknown,
    ): Promise<void> {
        const beyondtrustInstance = await this.getBeyondtrustInstance(transactionId, beyondtrustInstanceId);

        await firstValueFrom(
            defer(async () =>
                this.httpService.delete(UrlUtility.join(beyondtrustInstance.apiBaseUrl, urlPath), {
                    headers: {
                        Authorization: await this.getAuthHeader(beyondtrustInstance),
                    },
                    params: instanceToPlain(params),
                }),
            ).pipe(
                // flatten the Observable<Observable<AxiosResponse>> into Observable<AxiosResponse>
                // using RxJS's `mergeMap` or `switchMap`
                switchMap((response) => response), // unwrap inner Observable
                catchError((error) => {
                    const errorDetails = this.formatAxiosError(error, 'DELETE', urlPath, beyondtrustInstance, params);
                    console.error(errorDetails);
                    throw error;
                }),
                retry({
                    count: this.appConfigService.beyondTrust.api.communication.retryAttempts,
                    delay: (error) => {
                        if (error instanceof AxiosError) {
                            if (error.status === HttpStatusCode.Unauthorized) {
                                this.invalidateAuthHeader(beyondtrustInstance); // token will refresh next attempt
                            }

                            if (error.status && HttpClientService.RETRYABLE_STATUS_CODES.includes(error.status)) {
                                return timer(this.appConfigService.beyondTrust.api.communication.retryDelayInMs);
                            }
                        }

                        throw error;
                    },
                }),
                catchError((error) => {
                    // Rethrow the error as a nestjs HttpException
                    throw ErrorProcessorUtility.composeError(error);
                }),
            ),
        );
    }

    public async stream(
        transactionId: string,
        beyondtrustInstanceId: number,
        urlPath: string,
        params?: unknown,
    ): Promise<AxiosResponse<NodeJS.ReadableStream>> {
        const beyondtrustInstance = await this.getBeyondtrustInstance(transactionId, beyondtrustInstanceId);

        return firstValueFrom(
            this.httpService
                .get<NodeJS.ReadableStream>(UrlUtility.join(beyondtrustInstance.apiBaseUrl, urlPath), {
                    headers: {
                        Authorization: await this.getAuthHeader(beyondtrustInstance),
                    },
                    params: params ? instanceToPlain(params) : undefined,
                    responseType: 'stream',
                })
                .pipe(
                    catchError((error) => {
                        const errorDetails = this.formatAxiosError(
                            error,
                            'GET (stream)',
                            urlPath,
                            beyondtrustInstance,
                            params,
                        );
                        console.error(errorDetails);
                        return throwError(() => ErrorProcessorUtility.composeError(error));
                    }),
                ),
        );
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

    private formatAxiosError(
        error: unknown,
        method: string,
        urlPath: string,
        beyondtrustInstance: BeyondtrustInstance,
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _params?: unknown,
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _body?: unknown,
    ): string {
        if (error instanceof AxiosError) {
            // const fullUrl = UrlUtility.join(beyondtrustInstance.apiBaseUrl, urlPath);
            const responseData = error.response?.data ? JSON.stringify(error.response.data) : 'No response data';

            // TODO: Enhance error formatting to include in external monitoring/logging systems, and consider sanitizing sensitive information from logs
            return [
                `BT Error: ${error.response?.status || 'Unknown'}, ${error.response?.statusText || 'Unknown'}, ${responseData}`,
            ]
                .filter(Boolean)
                .join('\n');

            // return [
            //     `BeyondTrust API Error Details:`,
            //     `  Method: ${method}`,
            //     `  URL: ${fullUrl}`,
            //     `  Status Code: ${error.response?.status || 'Unknown'}`,
            //     `  Status Text: ${error.response?.statusText || 'Unknown'}`,
            //     `  Error Message: ${error.message}`,
            //     `  BT Instance ID: ${beyondtrustInstance.id}`,
            //     `  BT Instance Name: ${beyondtrustInstance.name}`,
            //     _params ? `  Request Params: ${JSON.stringify(_params)}` : '',
            //     _body ? `  Request Body: ${JSON.stringify(_body)}` : '',
            //     `  Response Data: ${responseData}`,
            //     `  Headers: ${error.response?.headers ? JSON.stringify(error.response.headers) : 'No headers'}`,
            // ]
            //     .filter(Boolean)
            //     .join('\n');
        } else {
            const fullUrl = UrlUtility.join(beyondtrustInstance.apiBaseUrl, urlPath);
            return [
                `Non-Axios Error Details:`,
                `  Method: ${method}`,
                `  URL: ${fullUrl}`,
                `  BT Instance ID: ${beyondtrustInstance.id}`,
                `  BT Instance Name: ${beyondtrustInstance.name}`,
                `  Error: ${String(error)}`,
            ].join('\n');
        }
    }
}
