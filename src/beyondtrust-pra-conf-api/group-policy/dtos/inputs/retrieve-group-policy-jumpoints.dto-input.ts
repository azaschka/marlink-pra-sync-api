import { PaginationDtoInput } from '../../../../shared/dtos/inputs';

export class RetrieveGroupPolicyJumpointsDtoInput extends PaginationDtoInput {
    public static create(perPage: number, currentPage: number): RetrieveGroupPolicyJumpointsDtoInput {
        const dto = new RetrieveGroupPolicyJumpointsDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;

        return dto;
    }
}
