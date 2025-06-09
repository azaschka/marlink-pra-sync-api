import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { WebJumpRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveWebJumpByIdQuery } from '../retrieve-web-jump-by-id.query';

@QueryHandler(RetrieveWebJumpByIdQuery)
export class RetrieveWebJumpByIdQueryHandler implements IQueryHandler<RetrieveWebJumpByIdQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveWebJumpByIdQuery): Promise<WebJumpRetrievedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.webJump.path,
            query.id.toString(),
        );

        return await this.httpClientService.get<WebJumpRetrievedDtoOutput, WebJumpRetrievedDtoOutput>(
            WebJumpRetrievedDtoOutput,
            url,
        );
    }
}
