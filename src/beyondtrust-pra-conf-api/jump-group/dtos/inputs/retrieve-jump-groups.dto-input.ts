import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDtoInput } from '../../../../shared/dtos/inputs';

export class RetrieveJumpGroupsDtoInput extends PaginationDtoInput {
    @IsString()
    @IsOptional()
    public name?: string;

    @Expose({ name: 'code_name' })
    @IsString()
    @IsOptional()
    public codeName?: string;

    public static create(
        perPage: number,
        currentPage: number,
        name?: string,
        codeName?: string,
    ): RetrieveJumpGroupsDtoInput {
        const dto = new RetrieveJumpGroupsDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;
        dto.name = name;
        dto.codeName = codeName;

        return dto;
    }
}
