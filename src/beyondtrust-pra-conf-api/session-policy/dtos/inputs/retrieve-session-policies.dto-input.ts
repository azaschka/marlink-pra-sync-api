import { PaginationDtoInput } from '../../../../shared/dtos/inputs';

export class RetrieveSessionPoliciesDtoInput extends PaginationDtoInput {
    public static create(perPage: number, currentPage: number): RetrieveSessionPoliciesDtoInput {
        const dto = new RetrieveSessionPoliciesDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;

        return dto;
    }
}
