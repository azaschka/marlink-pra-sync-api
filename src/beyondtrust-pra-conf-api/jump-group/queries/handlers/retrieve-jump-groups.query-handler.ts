import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveJumpGroupsDtoInput } from '../../dtos/inputs';
import { JumpGroupRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveJumpGroupsQuery } from '../retrieve-jump-groups.query';

@QueryHandler(RetrieveJumpGroupsQuery)
export class RetrieveJumpGroupsQueryHandler implements IQueryHandler<RetrieveJumpGroupsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveJumpGroupsQuery): Promise<JumpGroupRetrievedDtoOutput[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpGroup.path,
        );

        return await this.httpClientService.get<JumpGroupRetrievedDtoOutput, JumpGroupRetrievedDtoOutput[]>(
            JumpGroupRetrievedDtoOutput,
            url,
            RetrieveJumpGroupsDtoInput.create(query.pageSize, query.pageNumber, query.name, query.codeName),
        );
    }
}
