import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveSessionPoliciesDtoInput } from '../../dtos/inputs';
import { SessionPolicyRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveSessionPoliciesQuery } from '../retrieve-session-policies.query';

@QueryHandler(RetrieveSessionPoliciesQuery)
export class RetrieveSessionPoliciesQueryHandler implements IQueryHandler<RetrieveSessionPoliciesQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveSessionPoliciesQuery): Promise<SessionPolicyRetrievedDtoOutput[]> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.sessionPolicy.path,
        );

        return await this.httpClientService.get<SessionPolicyRetrievedDtoOutput, SessionPolicyRetrievedDtoOutput[]>(
            SessionPolicyRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
            RetrieveSessionPoliciesDtoInput.create(query.pageSize, query.pageNumber),
        );
    }
}
