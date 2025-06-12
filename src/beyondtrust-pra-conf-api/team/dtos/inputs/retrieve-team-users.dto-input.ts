import { PaginationDtoInput } from '../../../../shared/dtos/inputs';

export class RetrieveTeamUsersDtoInput extends PaginationDtoInput {
    public static create(perPage: number, currentPage: number): RetrieveTeamUsersDtoInput {
        const dto = new RetrieveTeamUsersDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;

        return dto;
    }
}
