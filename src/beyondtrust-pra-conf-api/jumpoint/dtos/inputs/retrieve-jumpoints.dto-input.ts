import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDtoInput } from '../../../../shared/dtos/inputs';

export class RetrieveJumpointsDtoInput extends PaginationDtoInput {
    @IsString()
    @IsOptional()
    public name?: string;

    @Expose({ name: 'public_ip' })
    @IsString()
    @IsOptional()
    public publicIp?: string;

    @Expose({ name: 'private_ip' })
    @IsString()
    @IsOptional()
    public privateIp?: string;

    @IsString()
    @IsOptional()
    public hostname?: string;

    @Expose({ name: 'code_name' })
    @IsString()
    @IsOptional()
    public codeName?: string;

    public static create(
        perPage: number,
        currentPage: number,
        name?: string,
        publicIp?: string,
        privateIp?: string,
        hostname?: string,
        codeName?: string,
    ): RetrieveJumpointsDtoInput {
        const dto = new RetrieveJumpointsDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;
        dto.name = name;
        dto.publicIp = publicIp;
        dto.privateIp = privateIp;
        dto.hostname = hostname;
        dto.codeName = codeName;

        return dto;
    }
}
