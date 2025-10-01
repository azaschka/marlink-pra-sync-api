import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveTeamUsersDtoInput } from '../../dtos/inputs';
import { TeamUserRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveTeamUsersQuery } from '../retrieve-team-users.query';

@QueryHandler(RetrieveTeamUsersQuery)
export class RetrieveTeamUsersQueryHandler implements IQueryHandler<RetrieveTeamUsersQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveTeamUsersQuery): Promise<TeamUserRetrievedDtoOutput[]> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.team.path,
            query.id.toString(),
            this.appConfigService.beyondTrust.api.config.team.user.path,
        );

        return await this.httpClientService.get<TeamUserRetrievedDtoOutput, TeamUserRetrievedDtoOutput[]>(
            TeamUserRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
            RetrieveTeamUsersDtoInput.create(query.pageSize, query.pageNumber),
        );
    }
}
