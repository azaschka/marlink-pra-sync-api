import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { ObjectUtility } from '../../../../shared/utilities';
import { GroupPolicyJumpGroupRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveAllGroupPolicyJumpGroupsQuery } from '../retrieve-all-group-policy-jump-groups.query';
import { RetrieveGroupPolicyJumpGroupsQuery } from '../retrieve-group-policy-jump-groups.query';

@QueryHandler(RetrieveAllGroupPolicyJumpGroupsQuery)
export class RetrieveAllGroupPolicyJumpGroupsQueryHandler implements IQueryHandler<RetrieveAllGroupPolicyJumpGroupsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
    ) {}

    public async execute(
        query: RetrieveAllGroupPolicyJumpGroupsQuery,
    ): Promise<GroupPolicyJumpGroupRetrievedDtoOutput[]> {
        const allGroupPolicyJumpGroups: GroupPolicyJumpGroupRetrievedDtoOutput[] = [];
        const maxBatchSize = this.appConfigService.discrepancy.maxBatchSize;
        let pageNumber = 1;

        while (true) {
            const batch = await this.queryBus.execute<
                RetrieveGroupPolicyJumpGroupsQuery,
                GroupPolicyJumpGroupRetrievedDtoOutput[]
            >(
                new RetrieveGroupPolicyJumpGroupsQuery(
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
                    allGroupPolicyJumpGroups.map((jumpGroup) => jumpGroup.jumpGroupId),
                    batch.map((jumpGroup) => jumpGroup.jumpGroupId),
                )
            ) {
                break;
            }

            allGroupPolicyJumpGroups.push(...batch);

            if (batch.length === 0 || batch.length < maxBatchSize) {
                break;
            }

            pageNumber++;
        }

        return allGroupPolicyJumpGroups;
    }
}
