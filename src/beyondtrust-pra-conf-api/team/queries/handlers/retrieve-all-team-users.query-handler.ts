import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { ObjectUtility } from '../../../../shared/utilities';
import { TeamUserRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveAllTeamUsersQuery } from '../retrieve-all-team-users.query';
import { RetrieveTeamUsersQuery } from '../retrieve-team-users.query';

@QueryHandler(RetrieveAllTeamUsersQuery)
export class RetrieveAllTeamUsersQueryHandler implements IQueryHandler<RetrieveAllTeamUsersQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
    ) {}

    public async execute(query: RetrieveAllTeamUsersQuery): Promise<TeamUserRetrievedDtoOutput[]> {
        const allTeamUsers: TeamUserRetrievedDtoOutput[] = [];
        const maxBatchSize = this.appConfigService.sync.maxBatchSize;
        let pageNumber = 1;

        while (true) {
            const batch = await this.queryBus.execute<RetrieveTeamUsersQuery, TeamUserRetrievedDtoOutput[]>(
                new RetrieveTeamUsersQuery(
                    query.transactionId,
                    query.beyondtrustInstanceId,
                    maxBatchSize,
                    pageNumber,
                    query.id,
                ),
            );

            // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
            if (
                ObjectUtility.contain(
                    allTeamUsers.map((teamUser) => teamUser.userId),
                    batch.map((teamUser) => teamUser.userId),
                )
            ) {
                break;
            }

            allTeamUsers.push(...batch);

            if (batch.length === 0 || batch.length < maxBatchSize) {
                break;
            }

            pageNumber++;
        }

        return allTeamUsers;
    }
}
