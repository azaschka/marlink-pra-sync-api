import { PaginationDtoInput } from '../../../../shared/dtos/inputs';

export class RetrieveGroupPolicyJumpGroupsDtoInput extends PaginationDtoInput {
    public static create(perPage: number, currentPage: number): RetrieveGroupPolicyJumpGroupsDtoInput {
        const dto = new RetrieveGroupPolicyJumpGroupsDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;

        return dto;
    }
}
