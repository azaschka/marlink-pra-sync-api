import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RetrieveWebJumpsDtoInput } from '../../dtos/inputs';
import { WebJumpRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveWebJumpsQuery } from '../retrieve-web-jumps.query';

@QueryHandler(RetrieveWebJumpsQuery)
export class RetrieveWebJumpsQueryHandler implements IQueryHandler<RetrieveWebJumpsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveWebJumpsQuery): Promise<WebJumpRetrievedDtoOutput[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.webJump.path,
        );

        return await this.httpClientService.get<WebJumpRetrievedDtoOutput, WebJumpRetrievedDtoOutput[]>(
            WebJumpRetrievedDtoOutput,
            url,
            RetrieveWebJumpsDtoInput.create(
                query.pageSize,
                query.pageNumber,
                query.name,
                query.url,
                query.jumpGroupId,
                query.jumpGroupType,
                query.jumpointId,
                query.tag,
            ),
        );
    }
}
