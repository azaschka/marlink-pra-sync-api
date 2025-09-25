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
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpPolicy.path,
        );

        return await this.httpClientService.get<JumpPolicyRetrievedDtoOutput, JumpPolicyRetrievedDtoOutput[]>(
            JumpPolicyRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
            RetrieveJumpPoliciesDtoInput.create(query.pageSize, query.pageNumber, query.codeName),
        );
    }
}
