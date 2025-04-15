import { Expose } from 'class-transformer';
import { BeyondtrustAuthTokenGrantType } from '../../enums';

export class BeyondtrustAuthTokenDtoInput {
    @Expose({ name: 'grant_type' })
    public grantType!: BeyondtrustAuthTokenGrantType;

    public static create(grantType: BeyondtrustAuthTokenGrantType): BeyondtrustAuthTokenDtoInput {
        const dto = new BeyondtrustAuthTokenDtoInput();
        dto.grantType = grantType;

        return dto;
    }
}
