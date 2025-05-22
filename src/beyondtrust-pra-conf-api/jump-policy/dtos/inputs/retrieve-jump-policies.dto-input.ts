import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDtoInput } from '../../../../shared/dtos/inputs';

export class RetrieveJumpPoliciesDtoInput extends PaginationDtoInput {
    @Expose({ name: 'code_name' })
    @IsString()
    @IsOptional()
    public codeName?: string;

    public static create(perPage: number, currentPage: number, codeName?: string): RetrieveJumpPoliciesDtoInput {
        const dto = new RetrieveJumpPoliciesDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;
        dto.codeName = codeName;

        return dto;
    }
}
