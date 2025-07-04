import { PaginationDtoInput } from '../../../../shared/dtos/inputs';

export class RetrieveGroupPolicyTeamsDtoInput extends PaginationDtoInput {
    public static create(perPage: number, currentPage: number): RetrieveGroupPolicyTeamsDtoInput {
        const dto = new RetrieveGroupPolicyTeamsDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;

        return dto;
    }
}
