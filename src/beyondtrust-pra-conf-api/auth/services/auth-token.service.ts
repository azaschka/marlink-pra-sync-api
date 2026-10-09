import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { createHash } from 'crypto';
import { firstValueFrom, map } from 'rxjs';
import { DateUtility } from '../../../shared/utilities';
import { AuthTokenDtoInput } from '../dtos/inputs';
import { AuthTokenDtoOutput } from '../dtos/outputs';
import { AuthTokenGrantType } from '../enums';
import { AuthToken } from '../models';

interface CachedAuthToken {
    readonly token: AuthToken;
    /** Epoch milliseconds from which the token is refreshed instead of reused. */
    readonly refreshAt: number;
}

/**
 * OAuth2 client credentials tokens per BeyondTrust instance.
 *
 * - Tokens are refreshed ahead of expiry (60 s, or 10 % of the lifetime if that is shorter), so requests do not
 *   start with a token that expires in flight.
 * - Concurrent requests for the same key share one token request (single-flight).
 * - invalidateAuthToken() with the token a failing request used only drops the cache entry if it still holds that
 *   token, so a late 401 for an old token cannot discard a token that was refreshed in the meantime.
 * - The cache key is a SHA-256 hash; the client secret is not kept in plain text as part of a key.
 * - A token request that does not answer within TOKEN_REQUEST_TIMEOUT_IN_MS fails; without a timeout one hanging
 *   token endpoint held every request of the instance (they share the token request).
 * - When the refresh ahead of expiry fails, the current token is used until it expires, and the refresh is
 *   attempted again after REFRESH_RETRY_INTERVAL_IN_MS. A token that was invalidated (401) is never reused.
 */
@Injectable()
export class AuthTokenService {
    public static readonly TOKEN_REQUEST_TIMEOUT_IN_MS = 30 * 1000;
    private static readonly REFRESH_MARGIN_IN_MS = 60 * 1000;
    private static readonly REFRESH_MARGIN_RATIO = 0.1;
    private static readonly REFRESH_RETRY_INTERVAL_IN_MS = 5 * 1000;

    private readonly logger = new Logger(AuthTokenService.name);
    private readonly authTokensCache = new Map<string, CachedAuthToken>();
    private readonly pendingAuthTokens = new Map<string, Promise<AuthToken>>();

    constructor(private readonly httpService: HttpService) {}

    public async getAuthToken(
        beyondtrustInstanceId: number,
        clientId: string,
        clientSecret: string,
        oauth2TokenUrl: string,
    ): Promise<AuthToken> {
        const authTokenCacheKey = this.generateAuthTokenCacheKey(
            beyondtrustInstanceId,
            clientId,
            clientSecret,
            oauth2TokenUrl,
        );

        const cached = this.authTokensCache.get(authTokenCacheKey);

        if (cached && Date.now() < cached.refreshAt) {
            return cached.token;
        }

        const pending = this.pendingAuthTokens.get(authTokenCacheKey);

        if (pending) {
            return pending;
        }

        const request = this.generateAuthToken(clientId, clientSecret, oauth2TokenUrl)
            .then((token) => {
                this.authTokensCache.set(authTokenCacheKey, { token, refreshAt: AuthTokenService.refreshAt(token) });

                return token;
            })
            .catch((error: unknown) => this.keepCurrentToken(authTokenCacheKey, beyondtrustInstanceId, error))
            .finally(() => {
                this.pendingAuthTokens.delete(authTokenCacheKey);
            });
        this.pendingAuthTokens.set(authTokenCacheKey, request);

        return request;
    }

    /**
     * Drops the cached token. With usedAccessToken, only if the cache still holds that token (compare and
     * invalidate); without it, unconditionally.
     */
    public invalidateAuthToken(
        beyondtrustInstanceId: number,
        clientId: string,
        clientSecret: string,
        oauth2TokenUrl: string,
        usedAccessToken?: string,
    ): void {
        const authTokenCacheKey = this.generateAuthTokenCacheKey(
            beyondtrustInstanceId,
            clientId,
            clientSecret,
            oauth2TokenUrl,
        );
        const cached = this.authTokensCache.get(authTokenCacheKey);

        if (!cached) {
            return;
        }

        if (usedAccessToken === undefined || cached.token.accessToken === usedAccessToken) {
            this.authTokensCache.delete(authTokenCacheKey);
        }
    }

    /** After a failed refresh: the cached token while it is still valid, otherwise the refresh error. */
    private keepCurrentToken(authTokenCacheKey: string, beyondtrustInstanceId: number, error: unknown): AuthToken {
        const cached = this.authTokensCache.get(authTokenCacheKey);
        const now = Date.now();

        if (!cached || now >= cached.token.expirationDate.getTime()) {
            throw error;
        }

        this.authTokensCache.set(authTokenCacheKey, {
            token: cached.token,
            refreshAt: Math.min(
                now + AuthTokenService.REFRESH_RETRY_INTERVAL_IN_MS,
                cached.token.expirationDate.getTime(),
            ),
        });
        this.logger.warn(
            `Refreshing the token of BeyondTrust instance ${beyondtrustInstanceId} failed; the current token is used until ${cached.token.expirationDate.toISOString()}: ${
                error instanceof Error ? error.message : String(error)
            }`,
        );

        return cached.token;
    }

    private static refreshAt(token: AuthToken): number {
        const now = Date.now();
        const lifetimeInMs = Math.max(0, token.expirationDate.getTime() - now);
        const marginInMs = Math.min(
            AuthTokenService.REFRESH_MARGIN_IN_MS,
            lifetimeInMs * AuthTokenService.REFRESH_MARGIN_RATIO,
        );

        return now + lifetimeInMs - marginInMs;
    }

    private async generateAuthToken(
        clientId: string,
        clientSecret: string,
        oauth2TokenUrl: string,
    ): Promise<AuthToken> {
        const result = await firstValueFrom(
            this.httpService
                .post<AuthTokenDtoOutput>(
                    oauth2TokenUrl,
                    {
                        ...instanceToPlain(AuthTokenDtoInput.create(AuthTokenGrantType.ClientCredentials)),
                    },
                    {
                        headers: this.composeHeaders(clientId, clientSecret),
                        timeout: AuthTokenService.TOKEN_REQUEST_TIMEOUT_IN_MS,
                    },
                )
                .pipe(map((response) => plainToInstance(AuthTokenDtoOutput, response.data))),
        );

        return {
            type: result.tokenType,
            accessToken: result.accessToken,
            expirationDate: DateUtility.addSeconds(new Date(), result.expiresInSeconds),
        };
    }

    private composeHeaders(clientId: string, clientSecret: string) {
        const base64AuthHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        return {
            Authorization: `Basic ${base64AuthHeader}`,
        };
    }

    private generateAuthTokenCacheKey(
        beyondtrustInstanceId: number,
        clientId: string,
        clientSecret: string,
        oauth2TokenUrl: string,
    ): string {
        return createHash('sha256')
            .update(JSON.stringify([beyondtrustInstanceId, clientId, clientSecret, oauth2TokenUrl]))
            .digest('hex');
    }
}
