import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveJumpPoliciesDtoInput } from '../../dtos/inputs';
import { JumpPolicyRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveJumpPoliciesQuery } from '../retrieve-jump-policies.query';

@QueryHandler(RetrieveJumpPoliciesQuery)
export class RetrieveJumpPoliciesQueryHandler implements IQueryHandler<RetrieveJumpPoliciesQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveJumpPoliciesQuery): Promise<JumpPolicyRetrievedDtoOutput[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.path.jumpPolicy,
        );

        return await this.httpClientService.get<JumpPolicyRetrievedDtoOutput, JumpPolicyRetrievedDtoOutput[]>(
            JumpPolicyRetrievedDtoOutput,
            url,
            RetrieveJumpPoliciesDtoInput.create(query.pageSize, query.pageNumber, query.codeName),
        );
    }
}
