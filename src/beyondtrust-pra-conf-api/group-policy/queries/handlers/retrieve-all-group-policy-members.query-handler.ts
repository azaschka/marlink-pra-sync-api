import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { ObjectUtility } from '../../../../shared/utilities';
import { GroupPolicyMemberRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveAllGroupPolicyMembersQuery } from '../retrieve-all-group-policy-members.query';
import { RetrieveGroupPolicyMembersQuery } from '../retrieve-group-policy-members.query';

@QueryHandler(RetrieveAllGroupPolicyMembersQuery)
export class RetrieveAllGroupPolicyMembersQueryHandler implements IQueryHandler<RetrieveAllGroupPolicyMembersQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
    ) {}

    public async execute(query: RetrieveAllGroupPolicyMembersQuery): Promise<GroupPolicyMemberRetrievedDtoOutput[]> {
        const allGroupPolicyMembers: GroupPolicyMemberRetrievedDtoOutput[] = [];
        const maxBatchSize = this.appConfigService.sync.maxBatchSize;
        let pageNumber = 1;

        while (true) {
            const batch = await this.queryBus.execute<
                RetrieveGroupPolicyMembersQuery,
                GroupPolicyMemberRetrievedDtoOutput[]
            >(
                new RetrieveGroupPolicyMembersQuery(
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
                    allGroupPolicyMembers.map((member) => member.userId),
                    batch.map((member) => member.userId),
                )
            ) {
                break;
            }

            allGroupPolicyMembers.push(...batch);

            if (batch.length === 0 || batch.length < maxBatchSize) {
                break;
            }

            pageNumber++;
        }

        return allGroupPolicyMembers;
    }
}
