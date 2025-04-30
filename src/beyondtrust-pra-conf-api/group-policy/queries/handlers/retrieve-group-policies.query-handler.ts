import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveGroupPoliciesDtoInput } from '../../dtos/inputs';
import { GroupPoliciesRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveGroupPoliciesQuery } from '../retrieve-group-policies.query';

@QueryHandler(RetrieveGroupPoliciesQuery)
export class RetrieveGroupPoliciesQueryHandler implements IQueryHandler<RetrieveGroupPoliciesQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveGroupPoliciesQuery): Promise<GroupPoliciesRetrievedDtoOutput[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.path.groupPolicy,
        );

        return await this.httpClientService.get<GroupPoliciesRetrievedDtoOutput, GroupPoliciesRetrievedDtoOutput[]>(
            GroupPoliciesRetrievedDtoOutput,
            url,
            RetrieveGroupPoliciesDtoInput.create(query.pageSize, query.pageNumber, query.name),
        );
    }
}
