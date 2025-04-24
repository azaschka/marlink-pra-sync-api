import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveJumpClientsDtoInput } from '../../dtos/inputs';
import { JumpClientRetrievedDtoOutput } from '../../dtos/outputs';
import { JumpClientRetrieved } from '../../models';
import { RetrieveJumpClientsQuery } from '../retrieve-jump-clients.query';

@QueryHandler(RetrieveJumpClientsQuery)
export class RetrieveJumpClientsQueryHandler implements IQueryHandler<RetrieveJumpClientsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveJumpClientsQuery): Promise<JumpClientRetrieved[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.path.jumpClient,
        );
        const result = await this.httpClientService.get<JumpClientRetrievedDtoOutput, JumpClientRetrievedDtoOutput[]>(
            JumpClientRetrievedDtoOutput,
            url,
            {
                ...RetrieveJumpClientsDtoInput.create(
                    query.pageSize,
                    query.pageNumber,
                    query.name,
                    query.hostname,
                    query.fqdn,
                    query.tag,
                    query.jumpGroupId,
                    query.jumpGroupType,
                    query.consoleUser,
                    query.publicIp,
                    query.privateIp,
                    query.connectionType,
                ),
            },
        );

        return result.map((jumpClient) => ({
            jumpGroupId: jumpClient.jumpGroupId,
            id: jumpClient.id,
            jumpGroupType: jumpClient.jumpGroupType,
            name: jumpClient.name,
            hostname: jumpClient.hostname,
            fqdn: jumpClient.fqdn,
            tag: jumpClient.tag,
            comments: jumpClient.comments,
            jumpPolicyId: jumpClient.jumpPolicyId,
            sessionPolicyId: jumpClient.sessionPolicyId,
            installMode: jumpClient.installMode,
            connectionType: jumpClient.connectionType,
            lastConnectTimestamp: jumpClient.lastConnectTimestamp,
            lastDisconnectTimestamp: jumpClient.lastDisconnectTimestamp,
            isLost: jumpClient.isLost,
            needsUpdate: jumpClient.needsUpdate,
            unavailableReason: jumpClient.unavailableReason,
            operatingSystem: jumpClient.operatingSystem,
            publicIp: jumpClient.publicIp,
            privateIp: jumpClient.privateIp,
            consoleUser: jumpClient.consoleUser,
            expirationTimestamp: jumpClient.expirationTimestamp,
            maxOfflineMinutes: jumpClient.maxOfflineMinutes,
            lastAccessTimestamp: jumpClient.lastAccessTimestamp,
            endpointAgreementPolicy: jumpClient.endpointAgreementPolicy,
            jumpointProxy: jumpClient.jumpointProxy,
        }));
    }
}
