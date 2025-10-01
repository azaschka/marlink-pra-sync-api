import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveGroupPolicyJumpGroupsDtoInput } from '../../dtos/inputs';
import { GroupPolicyJumpGroupRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveGroupPolicyJumpGroupsQuery } from '../retrieve-group-policy-jump-groups.query';

@QueryHandler(RetrieveGroupPolicyJumpGroupsQuery)
export class RetrieveGroupPolicyJumpGroupsQueryHandler implements IQueryHandler<RetrieveGroupPolicyJumpGroupsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveGroupPolicyJumpGroupsQuery): Promise<GroupPolicyJumpGroupRetrievedDtoOutput[]> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.groupPolicy.path,
            query.id.toString(),
            this.appConfigService.beyondTrust.api.config.groupPolicy.jumpGroup.path,
        );

        return await this.httpClientService.get<
            GroupPolicyJumpGroupRetrievedDtoOutput,
            GroupPolicyJumpGroupRetrievedDtoOutput[]
        >(
            GroupPolicyJumpGroupRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
            RetrieveGroupPolicyJumpGroupsDtoInput.create(query.pageSize, query.pageNumber),
        );
    }
}
