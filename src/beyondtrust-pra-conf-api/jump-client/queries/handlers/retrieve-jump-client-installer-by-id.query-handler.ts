import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpClientInstallerRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveJumpClientInstallerByIdQuery } from '../retrieve-jump-client-installer-by-id.query';

@QueryHandler(RetrieveJumpClientInstallerByIdQuery)
export class RetrieveJumpClientInstallerByIdQueryHandler
    implements IQueryHandler<RetrieveJumpClientInstallerByIdQuery>
{
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveJumpClientInstallerByIdQuery): Promise<JumpClientInstallerRetrievedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpClient.path,
            this.appConfigService.beyondTrust.api.jumpClient.installer.path,
            query.id.toString(),
        );

        return await this.httpClientService.get<
            JumpClientInstallerRetrievedDtoOutput,
            JumpClientInstallerRetrievedDtoOutput
        >(JumpClientInstallerRetrievedDtoOutput, url);
    }
}
