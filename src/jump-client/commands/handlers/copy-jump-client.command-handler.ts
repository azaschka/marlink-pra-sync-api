import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CopyJumpClientCommand as BTCopyJumpClientCommand } from '../../../beyondtrust-pra-conf-api/jump-client/commands';
import {
    JumpClientCopiedDtoOutput,
    JumpClientRetrievedDtoOutput,
} from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import { RetrieveJumpClientByIdQuery as BTRetrieveJumpClientByIdQuery } from '../../../beyondtrust-pra-conf-api/jump-client/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpClientCopiedEvent, JumpClientCopyFailedEvent } from '../../events';
import {
    mapFromBTJumpClientConnectionType,
    mapFromBTJumpClientEndpointAgreementPolicyType,
    mapFromBTJumpClientGroupType,
    mapFromBTJumpClientInstallMode,
    mapFromBTJumpClientUnavailableReasonType,
    mapToBTJumpClientGroupType,
} from '../../mappers';
import { JumpClient } from '../../models';
import { JumpClientEntity } from '../../repositories/entities';
import { JumpClientRepositoryService } from '../../repositories/services/jump-client-repository.service';
import { CopyJumpClientCommand } from '../copy-jump-client.command';

@CommandHandler(CopyJumpClientCommand)
export class CopyJumpClientCommandHandler implements ICommandHandler<CopyJumpClientCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        private readonly jumpClientRepositoryService: JumpClientRepositoryService,
    ) {}

    public async execute(command: CopyJumpClientCommand): Promise<JumpClient> {
        const btJumpClient = await this.copyBTJumpClient(command);
        const jumpClientEntity = this.createJumpClientEntity(btJumpClient);

        try {
            const createdJumpClient = await this.jumpClientRepositoryService.create(command.tenantId, jumpClientEntity);

            this.eventBus.publish(
                new JumpClientCopiedEvent(command.transactionId, {
                    jumpClient: createdJumpClient,
                    tenantId: command.tenantId,
                }),
            );

            return createdJumpClient;
        } catch (error) {
            this.eventBus.publish(
                new JumpClientCopyFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    jumpClient: jumpClientEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async copyBTJumpClient(command: CopyJumpClientCommand) {
        const response = await this.commandBus.execute<BTCopyJumpClientCommand, JumpClientCopiedDtoOutput>(
            new BTCopyJumpClientCommand(
                command.transactionId,
                command.tenantId,
                command.id,
                command.jumpGroupId,
                mapToBTJumpClientGroupType(command.jumpGroupType),
                command.name,
            ),
        );

        return await this.queryBus.execute<BTRetrieveJumpClientByIdQuery, JumpClientRetrievedDtoOutput>(
            new BTRetrieveJumpClientByIdQuery(command.transactionId, command.tenantId, response.destId),
        );
    }

    private createJumpClientEntity(btJumpClient: JumpClientRetrievedDtoOutput) {
        return JumpClientEntity.create(
            btJumpClient.id,
            btJumpClient.jumpGroupId,
            btJumpClient.jumpGroupType ? mapFromBTJumpClientGroupType(btJumpClient.jumpGroupType) : undefined,
            btJumpClient.name,
            btJumpClient.hostname,
            btJumpClient.fqdn,
            btJumpClient.tag,
            btJumpClient.comments,
            btJumpClient.jumpPolicyId,
            btJumpClient.sessionPolicyId,
            btJumpClient.installMode ? mapFromBTJumpClientInstallMode(btJumpClient.installMode) : undefined,
            btJumpClient.connectionType ? mapFromBTJumpClientConnectionType(btJumpClient.connectionType) : undefined,
            btJumpClient.lastConnectTimestamp,
            btJumpClient.lastDisconnectTimestamp,
            btJumpClient.isLost,
            btJumpClient.needsUpdate,
            btJumpClient.unavailableReason
                ? mapFromBTJumpClientUnavailableReasonType(btJumpClient.unavailableReason)
                : undefined,
            btJumpClient.operatingSystem,
            btJumpClient.publicIp,
            btJumpClient.privateIp,
            btJumpClient.consoleUser,
            btJumpClient.expirationTimestamp,
            btJumpClient.maxOfflineMinutes,
            btJumpClient.lastAccessTimestamp,
            btJumpClient.endpointAgreementPolicy
                ? mapFromBTJumpClientEndpointAgreementPolicyType(btJumpClient.endpointAgreementPolicy)
                : undefined,
            btJumpClient.jumpointProxy,
        );
    }
}
