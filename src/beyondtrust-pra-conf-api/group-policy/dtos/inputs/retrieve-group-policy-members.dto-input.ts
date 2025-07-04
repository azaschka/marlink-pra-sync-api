import { PaginationDtoInput } from '../../../../shared/dtos/inputs';

export class RetrieveGroupPolicyMembersDtoInput extends PaginationDtoInput {
    public static create(perPage: number, currentPage: number): RetrieveGroupPolicyMembersDtoInput {
        const dto = new RetrieveGroupPolicyMembersDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;

        return dto;
    }
}
