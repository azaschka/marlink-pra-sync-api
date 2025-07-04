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
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.groupPolicy.path,
            query.id.toString(),
            this.appConfigService.beyondTrust.api.groupPolicy.jumpGroup.path,
        );

        return await this.httpClientService.get<
            GroupPolicyJumpGroupRetrievedDtoOutput,
            GroupPolicyJumpGroupRetrievedDtoOutput[]
        >(
            GroupPolicyJumpGroupRetrievedDtoOutput,
            url,
            RetrieveGroupPolicyJumpGroupsDtoInput.create(query.pageSize, query.pageNumber),
        );
    }
}
