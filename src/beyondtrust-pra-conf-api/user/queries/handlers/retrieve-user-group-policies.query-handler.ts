import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { UserGroupPolicyRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveUserGroupPoliciesQuery } from '../retrieve-user-group-policies.query';

@QueryHandler(RetrieveUserGroupPoliciesQuery)
export class RetrieveUserGroupPoliciesQueryHandler implements IQueryHandler<RetrieveUserGroupPoliciesQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveUserGroupPoliciesQuery): Promise<UserGroupPolicyRetrievedDtoOutput[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.user.path,
            query.id.toString(),
            this.appConfigService.beyondTrust.api.user.groupPolicies.path,
        );

        return await this.httpClientService.get<UserGroupPolicyRetrievedDtoOutput, UserGroupPolicyRetrievedDtoOutput[]>(
            UserGroupPolicyRetrievedDtoOutput,
            url,
        );
    }
}
