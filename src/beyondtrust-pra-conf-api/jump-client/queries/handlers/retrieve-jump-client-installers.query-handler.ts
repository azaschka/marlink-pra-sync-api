import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveJumpClientInstallersDtoInput } from '../../dtos/inputs';
import { JumpClientInstallerRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveJumpClientInstallersQuery } from '../retrieve-jump-client-installers.query';

@QueryHandler(RetrieveJumpClientInstallersQuery)
export class RetrieveJumpClientInstallersQueryHandler implements IQueryHandler<RetrieveJumpClientInstallersQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveJumpClientInstallersQuery): Promise<JumpClientInstallerRetrievedDtoOutput[]> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpClient.path,
            this.appConfigService.beyondTrust.api.config.jumpClient.installer.path,
        );

        return await this.httpClientService.get<
            JumpClientInstallerRetrievedDtoOutput,
            JumpClientInstallerRetrievedDtoOutput[]
        >(
            JumpClientInstallerRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
            RetrieveJumpClientInstallersDtoInput.create(
                query.pageSize,
                query.pageNumber,
                query.name,
                query.hostname,
                query.fqdn,
                query.tag,
                query.jumpGroupId,
                query.jumpGroupType,
                query.connectionType,
            ),
        );
    }
}
