import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError, HttpStatusCode } from 'axios';
import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer';
import { catchError, firstValueFrom, map, retry, timer } from 'rxjs';
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

    public async get<C, O>(cls: ClassConstructor<C>, url: string, params?: Record<string, unknown>): Promise<O> {
        const result = await firstValueFrom(
            this.httpService
                .get<O>(url, {
                    headers: {
                        Authorization: await this.getBearerToken(),
                    },
                    params: {
                        ...instanceToPlain(params),
                    },
                })
                .pipe(
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
                                    this.authTokenService.invalidateAuthToken();
                                }

                                if (error.status && HttpClientService.RETRYABLE_STATUS_CODES.includes(error.status)) {
                                    return timer(this.appConfigService.beyondTrust.api.communication.retryDelayInMs);
                                }
                            }

                            throw error;
                        },
                    }),
                    map((response) => plainToInstance(cls, response.data)),
                ),
        );

        return result as O;
    }

    private async getBearerToken(): Promise<string> {
        const authToken = await this.authTokenService.getAuthToken();
        return `Bearer ${authToken.accessToken}`;
    }
}
