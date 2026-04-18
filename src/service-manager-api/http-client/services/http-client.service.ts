import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError, AxiosResponse, HttpStatusCode } from 'axios';
import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer';
import { catchError, defer, firstValueFrom, map, retry, throwError, timer } from 'rxjs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
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
    ) {}

    public async post<C, O>(cls: ClassConstructor<C> | undefined, url: string, body?: unknown): Promise<O> {
        const result = await firstValueFrom(
            defer(() =>
                this.httpService.post<O>(url, instanceToPlain(body), {
                    headers: {
                        Authorization: `Bearer ${this.authTokenService.getAuthToken().accessToken}`,
                    },
                }),
            ).pipe(
                catchError((error) => {
                    const errorDetails = this.formatAxiosError(error, 'POST', url, undefined, body);
                    console.error(errorDetails);
                    throw error;
                }),
                retry({
                    count: this.appConfigService.serviceManager.api.communication.retryAttempts,
                    delay: (error) => {
                        if (error instanceof AxiosError) {
                            if (error.status && HttpClientService.RETRYABLE_STATUS_CODES.includes(error.status)) {
                                return timer(this.appConfigService.serviceManager.api.communication.retryDelayInMs);
                            }
                        }

                        throw error;
                    },
                }),
                map((response) => (cls ? plainToInstance(cls, response.data) : response.data)),
                catchError((error) => {
                    // Rethrow the error as a nestjs HttpException
                    throw ErrorProcessorUtility.composeError(error);
                }),
            ),
        );

        return result as O;
    }

    public async stream(url: string): Promise<AxiosResponse<NodeJS.ReadableStream>> {
        return firstValueFrom(
            this.httpService
                .post<NodeJS.ReadableStream>(url, undefined, {
                    headers: {
                        Authorization: `Bearer ${this.authTokenService.getAuthToken().accessToken}`,
                    },
                    responseType: 'stream',
                })
                .pipe(
                    catchError((error) => {
                        const errorDetails = this.formatAxiosError(error, 'POST (stream)', url, undefined, undefined);
                        console.error(errorDetails);
                        return throwError(() => ErrorProcessorUtility.composeError(error));
                    }),
                ),
        );
    }

    private formatAxiosError(error: unknown, method: string, url: string, params?: unknown, body?: unknown): string {
        if (error instanceof AxiosError) {
            const responseData = error.response?.data ? JSON.stringify(error.response.data) : 'No response data';

            return [
                `Service Manager API Error Details:`,
                `  Method: ${method}`,
                `  URL: ${url}`,
                `  Status Code: ${error.response?.status || 'Unknown'}`,
                `  Status Text: ${error.response?.statusText || 'Unknown'}`,
                `  Error Message: ${error.message}`,
                params ? `  Request Params: ${JSON.stringify(params)}` : '',
                body ? `  Request Body: ${JSON.stringify(body)}` : '',
                `  Response Data: ${responseData}`,
                `  Headers: ${error.response?.headers ? JSON.stringify(error.response.headers) : 'No headers'}`,
            ]
                .filter(Boolean)
                .join('\n');
        } else {
            return [
                `Non-Axios Error Details:`,
                `  Method: ${method}`,
                `  URL: ${url}`,
                `  Error: ${String(error)}`,
            ].join('\n');
        }
    }
}
