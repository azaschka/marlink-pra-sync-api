import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { ObjectUtility } from '../../../../shared/utilities';
import { GroupPolicyTeamRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveAllGroupPolicyTeamsQuery } from '../retrieve-all-group-policy-teams.query';
import { RetrieveGroupPolicyTeamsQuery } from '../retrieve-group-policy-teams.query';

@QueryHandler(RetrieveAllGroupPolicyTeamsQuery)
export class RetrieveAllGroupPolicyTeamsQueryHandler implements IQueryHandler<RetrieveAllGroupPolicyTeamsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
    ) {}

    public async execute(query: RetrieveAllGroupPolicyTeamsQuery): Promise<GroupPolicyTeamRetrievedDtoOutput[]> {
        const allGroupPolicyTeams: GroupPolicyTeamRetrievedDtoOutput[] = [];
        const maxBatchSize = this.appConfigService.sync.maxBatchSize;
        let pageNumber = 1;

        while (true) {
            const batch = await this.queryBus.execute<
                RetrieveGroupPolicyTeamsQuery,
                GroupPolicyTeamRetrievedDtoOutput[]
            >(new RetrieveGroupPolicyTeamsQuery(query.transactionId, maxBatchSize, pageNumber, query.id));

            // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
            if (
                ObjectUtility.contain(
                    allGroupPolicyTeams.map((team) => team.teamId),
                    batch.map((team) => team.teamId),
                )
            ) {
                break;
            }

            allGroupPolicyTeams.push(...batch);

            if (batch.length === 0 || batch.length < maxBatchSize) {
                break;
            }

            pageNumber++;
        }

        return allGroupPolicyTeams;
    }
}
