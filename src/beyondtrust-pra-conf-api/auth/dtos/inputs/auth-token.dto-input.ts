import { Expose } from 'class-transformer';
import { AuthTokenGrantType } from '../../enums';

export class AuthTokenDtoInput {
    @Expose({ name: 'grant_type' })
    public grantType!: AuthTokenGrantType;

    public static create(grantType: AuthTokenGrantType): AuthTokenDtoInput {
        const dto = new AuthTokenDtoInput();
        dto.grantType = grantType;

        return dto;
    }
}
