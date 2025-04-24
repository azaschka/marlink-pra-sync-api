import { Expose } from 'class-transformer';

export class AuthTokenDtoOutput {
    @Expose({ name: 'token_type' })
    public tokenType!: string;

    @Expose({ name: 'expires_in' })
    public expiresInSeconds!: number;

    @Expose({ name: 'access_token' })
    public accessToken!: string;
}
