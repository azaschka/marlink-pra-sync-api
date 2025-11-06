import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveGroupPolicyMembersDtoInput } from '../../dtos/inputs';
import { GroupPolicyMemberRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveGroupPolicyMembersQuery } from '../retrieve-group-policy-members.query';

@QueryHandler(RetrieveGroupPolicyMembersQuery)
export class RetrieveGroupPolicyMembersQueryHandler implements IQueryHandler<RetrieveGroupPolicyMembersQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveGroupPolicyMembersQuery): Promise<GroupPolicyMemberRetrievedDtoOutput[]> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.groupPolicy.path,
            query.id.toString(),
            this.appConfigService.beyondTrust.api.config.groupPolicy.member.path,
        );

        return await this.httpClientService.get<
            GroupPolicyMemberRetrievedDtoOutput,
            GroupPolicyMemberRetrievedDtoOutput[]
        >(
            GroupPolicyMemberRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
            RetrieveGroupPolicyMembersDtoInput.create(query.pageSize, query.pageNumber),
        );
    }
}
