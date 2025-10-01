import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveJumpGroupsDtoInput } from '../../dtos/inputs';
import { JumpGroupRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveJumpGroupsQuery } from '../retrieve-jump-groups.query';

@QueryHandler(RetrieveJumpGroupsQuery)
export class RetrieveJumpGroupsQueryHandler implements IQueryHandler<RetrieveJumpGroupsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveJumpGroupsQuery): Promise<JumpGroupRetrievedDtoOutput[]> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpGroup.path,
        );

        return await this.httpClientService.get<JumpGroupRetrievedDtoOutput, JumpGroupRetrievedDtoOutput[]>(
            JumpGroupRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
            RetrieveJumpGroupsDtoInput.create(query.pageSize, query.pageNumber, query.name, query.codeName),
        );
    }
}
