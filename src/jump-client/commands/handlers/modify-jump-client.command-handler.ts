import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyJumpClientCommand as BTModifyJumpClientCommand } from '../../../beyondtrust-pra-conf-api/jump-client/commands';
import { JumpClientModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpClientModificationFailedEvent, JumpClientModifiedEvent } from '../../events';
import {
    mapFromBTJumpClientConnectionType,
    mapFromBTJumpClientEndpointAgreementPolicyType,
    mapFromBTJumpClientGroupType,
    mapFromBTJumpClientInstallMode,
    mapFromBTJumpClientUnavailableReasonType,
    mapToBTJumpClientEndpointAgreementPolicyType,
    mapToBTJumpClientGroupType,
} from '../../mappers';
import { JumpClient } from '../../models';
import { JumpClientEntity } from '../../repositories/entities';
import { JumpClientRepositoryService } from '../../repositories/services/jump-client-repository.service';
import { ModifyJumpClientCommand } from '../modify-jump-client.command';

@CommandHandler(ModifyJumpClientCommand)
export class ModifyJumpClientCommandHandler implements ICommandHandler<ModifyJumpClientCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpClientRepositoryService: JumpClientRepositoryService,
    ) {}

    public async execute(command: ModifyJumpClientCommand): Promise<JumpClient> {
        const btJumpClient = await this.modifyBTJumpClient(command);
        const jumpClientEntity = this.createJumpClientEntity(btJumpClient);

        try {
            const updatedJumpClient = await this.updateJumpClient(command.tenantId, jumpClientEntity);

            this.eventBus.publish(
                new JumpClientModifiedEvent(command.transactionId, {
                    jumpClient: updatedJumpClient,
                }),
            );

            return updatedJumpClient;
        } catch (error) {
            this.eventBus.publish(
                new JumpClientModificationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    jumpClient: jumpClientEntity,
                }),
            );

            throw error;
        }
    }

    private async modifyBTJumpClient(command: ModifyJumpClientCommand) {
        return await this.commandBus.execute<BTModifyJumpClientCommand, JumpClientModifiedDtoOutput>(
            new BTModifyJumpClientCommand(
                command.transactionId,
                command.id,
                command.jumpGroupId,
                command.jumpGroupType ? mapToBTJumpClientGroupType(command.jumpGroupType) : undefined,
                command.name,
                command.tag,
                command.comments,
                command.jumpPolicyId,
                command.sessionPolicyId,
                command.maxOfflineDurationInMinutes,
                command.endpointAgreementPolicyType
                    ? mapToBTJumpClientEndpointAgreementPolicyType(command.endpointAgreementPolicyType)
                    : undefined,
            ),
        );
    }

    private createJumpClientEntity(btJumpClient: JumpClientModifiedDtoOutput) {
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

    private async updateJumpClient(tenantId: number, jumpClientEntity: JumpClientEntity) {
        await this.jumpClientRepositoryService.createOrUpdateById(tenantId, jumpClientEntity);

        const createdOrUpdatedJumpClient = await this.jumpClientRepositoryService.findOneById(
            tenantId,
            jumpClientEntity.id,
        );

        if (!createdOrUpdatedJumpClient) {
            throw new Error('JumpClient has been created or updated but could not be retrieved.');
        }

        return createdOrUpdatedJumpClient;
    }
}
