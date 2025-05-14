import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDtoInput } from '../../../../shared/dtos/inputs';

export class RetrieveTeamsDtoInput extends PaginationDtoInput {
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
    ): RetrieveTeamsDtoInput {
        const dto = new RetrieveTeamsDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;
        dto.name = name;
        dto.codeName = codeName;

        return dto;
    }
}
