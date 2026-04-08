import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { ObjectUtility } from '../../../../shared/utilities';
import { GroupPolicyJumpointRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveAllGroupPolicyJumpointsQuery } from '../retrieve-all-group-policy-jumpoints.query';
import { RetrieveGroupPolicyJumpointsQuery } from '../retrieve-group-policy-jumpoints.query';

@QueryHandler(RetrieveAllGroupPolicyJumpointsQuery)
export class RetrieveAllGroupPolicyJumpointsQueryHandler implements IQueryHandler<RetrieveAllGroupPolicyJumpointsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
    ) {}

    public async execute(
        query: RetrieveAllGroupPolicyJumpointsQuery,
    ): Promise<GroupPolicyJumpointRetrievedDtoOutput[]> {
        const allGroupPolicyJumpoints: GroupPolicyJumpointRetrievedDtoOutput[] = [];
        const maxBatchSize = this.appConfigService.discrepancy.maxBatchSize;
        let pageNumber = 1;

        while (true) {
            const batch = await this.queryBus.execute<
                RetrieveGroupPolicyJumpointsQuery,
                GroupPolicyJumpointRetrievedDtoOutput[]
            >(
                new RetrieveGroupPolicyJumpointsQuery(
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
                    allGroupPolicyJumpoints.map((jumpoint) => jumpoint.jumpointId),
                    batch.map((jumpoint) => jumpoint.jumpointId),
                )
            ) {
                break;
            }

            allGroupPolicyJumpoints.push(...batch);

            if (batch.length === 0 || batch.length < maxBatchSize) {
                break;
            }

            pageNumber++;
        }

        return allGroupPolicyJumpoints;
    }
}
