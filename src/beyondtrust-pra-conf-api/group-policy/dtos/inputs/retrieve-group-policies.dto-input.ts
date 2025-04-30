import { IsOptional, IsString } from 'class-validator';
import { PaginationDtoInput } from '../../../../shared/dtos/inputs';

export class RetrieveGroupPoliciesDtoInput extends PaginationDtoInput {
    @IsString()
    @IsOptional()
    public name?: string;

    public static create(perPage: number, currentPage: number, name?: string): RetrieveGroupPoliciesDtoInput {
        const dto = new RetrieveGroupPoliciesDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;
        dto.name = name;

        return dto;
    }
}
