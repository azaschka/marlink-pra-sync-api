import { Expose } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDtoInput } from '../../../../shared/dtos/inputs';

export class RetrieveUsersDtoInput extends PaginationDtoInput {
    @Expose({ name: 'security_provider_id' })
    @IsInt()
    @IsOptional()
    public securityProviderId?: number;

    @IsString()
    @IsOptional()
    public username?: string;

    @Expose({ name: 'email_address' })
    @IsString()
    @IsOptional()
    public emailAddress?: string;

    public static create(
        perPage: number,
        currentPage: number,
        securityProviderId?: number,
        username?: string,
        email?: string,
    ): RetrieveUsersDtoInput {
        const dto = new RetrieveUsersDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;
        dto.securityProviderId = securityProviderId;
        dto.username = username;
        dto.emailAddress = email;

        return dto;
    }
}
