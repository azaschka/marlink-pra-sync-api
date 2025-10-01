import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpClientRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveJumpClientByIdQuery } from '../retrieve-jump-client-by-id.query';

@QueryHandler(RetrieveJumpClientByIdQuery)
export class RetrieveJumpClientByIdQueryHandler implements IQueryHandler<RetrieveJumpClientByIdQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveJumpClientByIdQuery): Promise<JumpClientRetrievedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpClient.path,
            query.id.toString(),
        );

        return await this.httpClientService.get<JumpClientRetrievedDtoOutput, JumpClientRetrievedDtoOutput>(
            JumpClientRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
        );
    }
}
