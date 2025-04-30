import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosError, HttpStatusCode } from 'axios';
import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer';
import { catchError, defer, firstValueFrom, map, retry, switchMap, timer } from 'rxjs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { AuthTokenService } from '../../auth/services/auth-token.service';

@Injectable()
export class HttpClientService {
    private static readonly RETRYABLE_STATUS_CODES = [
        HttpStatusCode.Unauthorized,
        HttpStatusCode.RequestTimeout,
        HttpStatusCode.TooManyRequests,
        HttpStatusCode.InternalServerError,
        HttpStatusCode.BadGateway,
        HttpStatusCode.ServiceUnavailable,
        HttpStatusCode.GatewayTimeout,
    ];

    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpService: HttpService,
        private readonly authTokenService: AuthTokenService,
    ) {}

    public async get<C, O>(cls: ClassConstructor<C>, url: string, params?: unknown): Promise<O> {
        const result = await firstValueFrom(
            defer(async () =>
                this.httpService.get<O>(url, {
                    headers: {
                        Authorization: await this.getAuthHeader(),
                    },
                    params: instanceToPlain(params),
                }),
            ).pipe(
                // flatten the Observable<Observable<AxiosResponse>> into Observable<AxiosResponse>
                // using RxJS's `mergeMap` or `switchMap`
                switchMap((response) => response), // unwrap inner Observable
                catchError((error) => {
                    if (error instanceof AxiosError) {
                        console.error(`Axios error status code: ${error.status}. Message: ${error.message}`);
                    } else {
                        console.error(`Unknown error: ${error}`);
                    }

                    throw error;
                }),
                retry({
                    count: this.appConfigService.beyondTrust.api.communication.retryAttempts,
                    delay: (error) => {
                        if (error instanceof AxiosError) {
                            if (error.status === HttpStatusCode.Unauthorized) {
                                this.authTokenService.invalidateAuthToken(); // token will refresh next attempt
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
                    throw this.composeError(error);
                }),
            ),
        );

        return result as O;
    }

    public async post<C, O>(cls: ClassConstructor<C>, url: string, body?: unknown): Promise<O> {
        const result = await firstValueFrom(
            defer(async () =>
                this.httpService.post<O>(url, instanceToPlain(body), {
                    headers: {
                        Authorization: await this.getAuthHeader(),
                    },
                }),
            ).pipe(
                switchMap((response) => response),
                catchError((error) => {
                    if (error instanceof AxiosError) {
                        console.error(`Axios error status code: ${error.status}. Message: ${error.message}`);
                    } else {
                        console.error(`Unknown error: ${error}`);
                    }

                    throw error;
                }),
                retry({
                    count: this.appConfigService.beyondTrust.api.communication.retryAttempts,
                    delay: (error) => {
                        if (error instanceof AxiosError) {
                            if (error.status === HttpStatusCode.Unauthorized) {
                                this.authTokenService.invalidateAuthToken(); // token will refresh next attempt
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
                    throw this.composeError(error);
                }),
            ),
        );

        return result as O;
    }

    public async patch<C, O>(cls: ClassConstructor<C>, url: string, body?: unknown): Promise<O> {
        const result = await firstValueFrom(
            defer(async () =>
                this.httpService.patch<O>(url, instanceToPlain(body), {
                    headers: {
                        Authorization: await this.getAuthHeader(),
                    },
                }),
            ).pipe(
                switchMap((response) => response),
                catchError((error) => {
                    if (error instanceof AxiosError) {
                        console.error(`Axios error status code: ${error.status}. Message: ${error.message}`);
                    } else {
                        console.error(`Unknown error: ${error}`);
                    }

                    throw error;
                }),
                retry({
                    count: this.appConfigService.beyondTrust.api.communication.retryAttempts,
                    delay: (error) => {
                        if (error instanceof AxiosError) {
                            if (error.status === HttpStatusCode.Unauthorized) {
                                this.authTokenService.invalidateAuthToken(); // token will refresh next attempt
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
                    throw this.composeError(error);
                }),
            ),
        );

        return result as O;
    }

    public async delete(url: string, params?: unknown): Promise<void> {
        await firstValueFrom(
            defer(async () =>
                this.httpService.delete(url, {
                    headers: {
                        Authorization: await this.getAuthHeader(),
                    },
                    params: instanceToPlain(params),
                }),
            ).pipe(
                // flatten the Observable<Observable<AxiosResponse>> into Observable<AxiosResponse>
                // using RxJS's `mergeMap` or `switchMap`
                switchMap((response) => response), // unwrap inner Observable
                catchError((error) => {
                    if (error instanceof AxiosError) {
                        console.error(`Axios error status code: ${error.status}. Message: ${error.message}`);
                    } else {
                        console.error(`Unknown error: ${error}`);
                    }

                    throw error;
                }),
                retry({
                    count: this.appConfigService.beyondTrust.api.communication.retryAttempts,
                    delay: (error) => {
                        if (error instanceof AxiosError) {
                            if (error.status === HttpStatusCode.Unauthorized) {
                                this.authTokenService.invalidateAuthToken(); // token will refresh next attempt
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
                    throw this.composeError(error);
                }),
            ),
        );
    }

    private async getAuthHeader(): Promise<string> {
        const authToken = await this.authTokenService.getAuthToken();

        return `Bearer ${authToken.accessToken}`;
    }

    private composeError(error: unknown) {
        if (error instanceof AxiosError) {
            return new HttpException(
                error.response?.data ? (error.response?.data as Record<string, unknown>) : error.message,
                error.response?.status || HttpStatusCode.InternalServerError,
            );
        }

        return new HttpException(JSON.stringify(error), HttpStatusCode.InternalServerError);
    }
}
