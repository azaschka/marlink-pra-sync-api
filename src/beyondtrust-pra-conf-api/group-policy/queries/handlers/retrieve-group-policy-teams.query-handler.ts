import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveGroupPolicyTeamsDtoInput } from '../../dtos/inputs';
import { GroupPolicyTeamRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveGroupPolicyTeamsQuery } from '../retrieve-group-policy-teams.query';

@QueryHandler(RetrieveGroupPolicyTeamsQuery)
export class RetrieveGroupPolicyTeamsQueryHandler implements IQueryHandler<RetrieveGroupPolicyTeamsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveGroupPolicyTeamsQuery): Promise<GroupPolicyTeamRetrievedDtoOutput[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.groupPolicy.path,
            query.id.toString(),
            this.appConfigService.beyondTrust.api.groupPolicy.team.path,
        );

        return await this.httpClientService.get<GroupPolicyTeamRetrievedDtoOutput, GroupPolicyTeamRetrievedDtoOutput[]>(
            GroupPolicyTeamRetrievedDtoOutput,
            url,
            RetrieveGroupPolicyTeamsDtoInput.create(query.pageSize, query.pageNumber),
        );
    }
}
