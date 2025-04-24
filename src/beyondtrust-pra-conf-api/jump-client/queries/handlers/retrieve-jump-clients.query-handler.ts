import { HttpService } from '@nestjs/axios';
import { CommandBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { firstValueFrom, map } from 'rxjs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { GenerateBeyondtrustAuthTokenCommand } from '../../../auth/commands/index.ts/generate-beyondtrust-auth-token.command';
import { BeyondtrustAuthToken } from '../../../auth/models';
import { RetrieveJumpClientsDtoInput } from '../../dtos/inputs';
import { JumpClientRetrievedDtoOutput } from '../../dtos/outputs';
import { JumpClientRetrieved } from '../../models';
import { RetrieveJumpClientsQuery } from '../retrieve-jump-clients.query';

@QueryHandler(RetrieveJumpClientsQuery)
export class RetrieveJumpClientsQueryHandler implements IQueryHandler<RetrieveJumpClientsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly commandBus: CommandBus,
        private readonly httpService: HttpService,
    ) {}

    public async execute(query: RetrieveJumpClientsQuery): Promise<JumpClientRetrieved[]> {
        const url = `${this.appConfigService.beyondTrust.api.baseUrl}/jump-client`;

        const authToken = await this.commandBus.execute<GenerateBeyondtrustAuthTokenCommand, BeyondtrustAuthToken>(
            new GenerateBeyondtrustAuthTokenCommand(query.transactionId),
        );

        const response = await firstValueFrom(
            this.httpService
                .get<JumpClientRetrievedDtoOutput[]>(url, {
                    params: {
                        ...instanceToPlain(
                            RetrieveJumpClientsDtoInput.create(
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
                        ),
                    },
                    headers: {
                        Authorization: `Bearer ${authToken.accessToken}`,
                    },
                })
                .pipe(map((response) => plainToInstance(JumpClientRetrievedDtoOutput, response.data))),
        );

        return response.map((jumpClient) => ({
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
