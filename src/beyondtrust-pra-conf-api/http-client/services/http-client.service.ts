import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer';
import { firstValueFrom, map } from 'rxjs';
import { AuthTokenService } from '../../auth/services/auth-token.service';

@Injectable()
export class HttpClientService {
    constructor(
        private readonly httpService: HttpService,
        private readonly authTokenService: AuthTokenService,
    ) {}

    // TODO retry on auth error
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
                .pipe(map((response) => plainToInstance(cls, response.data))),
        );

        return result as O;
    }
}
