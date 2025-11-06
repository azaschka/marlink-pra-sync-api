import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveGroupPoliciesDtoInput } from '../../dtos/inputs';
import { GroupPolicyRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveGroupPoliciesQuery } from '../retrieve-group-policies.query';

@QueryHandler(RetrieveGroupPoliciesQuery)
export class RetrieveGroupPoliciesQueryHandler implements IQueryHandler<RetrieveGroupPoliciesQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveGroupPoliciesQuery): Promise<GroupPolicyRetrievedDtoOutput[]> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.groupPolicy.path,
        );

        return await this.httpClientService.get<GroupPolicyRetrievedDtoOutput, GroupPolicyRetrievedDtoOutput[]>(
            GroupPolicyRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
            RetrieveGroupPoliciesDtoInput.create(query.pageSize, query.pageNumber, query.name),
        );
    }
}
