import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AuthTokenService } from '../../auth/services/auth-token.service';

@Injectable()
export class HttpClientService {
    constructor(
        private readonly httpService: HttpService,
        private readonly authTokenService: AuthTokenService,
    ) {}

    public async get<C, O>(cls: ClassConstructor<C>, url: string, params?: Record<string, unknown>): Promise<O> {
        const authToken = await this.authTokenService.getAuthToken();

        const result = await firstValueFrom(
            this.httpService
                .get<O>(url, {
                    headers: {
                        Authorization: `Bearer ${authToken.accessToken}`,
                    },
                    params: {
                        ...instanceToPlain(params),
                    },
                })
                .pipe(
                    catchError((error) => {
                        // Invalidate the auth token if a 401 error occurs.
                        // This will force a new token to be generated on the next request.
                        // Retry mechanism should not be implemented here but in the user class.
                        if (error instanceof AxiosError && error.status === 401) {
                            this.authTokenService.invalidateAuthToken();
                        }

                        throw error;
                    }),
                    map((response) => plainToInstance(cls, response.data)),
                ),
        );

        return result as O;
    }
}
