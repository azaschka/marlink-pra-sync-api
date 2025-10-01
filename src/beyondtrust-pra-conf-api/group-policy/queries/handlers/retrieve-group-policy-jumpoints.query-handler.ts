import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveGroupPolicyJumpointsDtoInput } from '../../dtos/inputs';
import { GroupPolicyJumpointRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveGroupPolicyJumpointsQuery } from '../retrieve-group-policy-jumpoints.query';

@QueryHandler(RetrieveGroupPolicyJumpointsQuery)
export class RetrieveGroupPolicyJumpointsQueryHandler implements IQueryHandler<RetrieveGroupPolicyJumpointsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveGroupPolicyJumpointsQuery): Promise<GroupPolicyJumpointRetrievedDtoOutput[]> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.groupPolicy.path,
            query.id.toString(),
            this.appConfigService.beyondTrust.api.config.groupPolicy.jumpoint.path,
        );

        return await this.httpClientService.get<
            GroupPolicyJumpointRetrievedDtoOutput,
            GroupPolicyJumpointRetrievedDtoOutput[]
        >(
            GroupPolicyJumpointRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
            RetrieveGroupPolicyJumpointsDtoInput.create(query.pageSize, query.pageNumber),
        );
    }
}
