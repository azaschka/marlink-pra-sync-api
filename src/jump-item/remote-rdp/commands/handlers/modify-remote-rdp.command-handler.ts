import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyRemoteRdpCommand as BTModifyRemoteRdpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/commands';
import { RemoteRdpModifiedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/dtos/outputs';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteRdpModificationFailedEvent, RemoteRdpModifiedEvent } from '../../events';
import {
    mapFromBTJumpGroupType,
    mapFromBTRdpQualityMode,
    mapFromBTSecureAppType,
    mapToBTJumpGroupType,
    mapToBTRdpQualityMode,
    mapToBTSecureAppType,
} from '../../mappers';
import { RemoteRdp } from '../../models';
import { RemoteRdpEntity } from '../../repositories/entities';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { ModifyRemoteRdpCommand } from '../modify-remote-rdp.command';

@CommandHandler(ModifyRemoteRdpCommand)
export class ModifyRemoteRdpCommandHandler implements ICommandHandler<ModifyRemoteRdpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly remoteRdpRepositoryService: RemoteRdpRepositoryService,
    ) {}

    public async execute(command: ModifyRemoteRdpCommand): Promise<RemoteRdp> {
        const btRemoteRdp = await this.modifyBTRemoteRdp(command);
        const remoteRdpEntity = this.createRemoteRdpEntity(btRemoteRdp);

        try {
            const updatedRemoteRdp = await this.updateRemoteRdp(command.tenantId, remoteRdpEntity);

            this.eventBus.publish(
                new RemoteRdpModifiedEvent(command.transactionId, {
                    remoteRdp: updatedRemoteRdp,
                    tenantId: command.tenantId,
                }),
            );

            return updatedRemoteRdp;
        } catch (error) {
            this.eventBus.publish(
                new RemoteRdpModificationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    remoteRdp: remoteRdpEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async modifyBTRemoteRdp(command: ModifyRemoteRdpCommand) {
        return await this.commandBus.execute<BTModifyRemoteRdpCommand, RemoteRdpModifiedDtoOutput>(
            new BTModifyRemoteRdpCommand(
                command.transactionId,
                command.tenantId,
                command.id,
                command.name,
                command.jumpointId,
                command.hostname,
                command.jumpGroupId,
                command.jumpGroupType ? mapToBTJumpGroupType(command.jumpGroupType) : undefined,
                command.qualityMode ? mapToBTRdpQualityMode(command.qualityMode) : undefined,
                command.mustStartNewConsoleSession,
                command.mustIgnoreUntrustedServerCert,
                command.tag,
                command.comments,
                command.rdpUsername,
                command.domain,
                command.jumpPolicyId,
                command.isSessionForensicsEnabled,
                command.sessionPolicyId,
                command.secureAppType ? mapToBTSecureAppType(command.secureAppType) : undefined,
                command.remoteAppName,
                command.remoteAppParams,
                command.remoteExePath,
                command.remoteExeParams,
                command.targetSystem,
                command.credentialType,
            ),
        );
    }

    private createRemoteRdpEntity(btRemoteRdp: RemoteRdpModifiedDtoOutput) {
        return RemoteRdpEntity.create(
            btRemoteRdp.id,
            btRemoteRdp.name,
            btRemoteRdp.jumpointId,
            btRemoteRdp.hostname,
            btRemoteRdp.jumpGroupId,
            btRemoteRdp.jumpGroupType ? mapFromBTJumpGroupType(btRemoteRdp.jumpGroupType) : undefined,
            btRemoteRdp.quality ? mapFromBTRdpQualityMode(btRemoteRdp.quality) : undefined,
            btRemoteRdp.console,
            btRemoteRdp.ignoreUntrusted,
            btRemoteRdp.tag,
            btRemoteRdp.comments,
            btRemoteRdp.rdpUsername,
            btRemoteRdp.domain,
            btRemoteRdp.jumpPolicyId,
            btRemoteRdp.sessionForensics,
            btRemoteRdp.sessionPolicyId,
            btRemoteRdp.endpointId,
            btRemoteRdp.secureAppType ? mapFromBTSecureAppType(btRemoteRdp.secureAppType) : undefined,
            btRemoteRdp.remoteAppName,
            btRemoteRdp.remoteAppParams,
            btRemoteRdp.remoteExePath,
            btRemoteRdp.remoteExeParams,
            btRemoteRdp.targetSystem,
            btRemoteRdp.credentialType,
        );
    }

    private async updateRemoteRdp(tenantId: number, remoteRdpEntity: RemoteRdpEntity) {
        await this.remoteRdpRepositoryService.createOrUpdateById(tenantId, remoteRdpEntity);

        const createdOrUpdatedRemoteRdp = await this.remoteRdpRepositoryService.findOneById(
            tenantId,
            remoteRdpEntity.id,
        );

        if (!createdOrUpdatedRemoteRdp) {
            throw new Error('Remote rdp has been created or updated but could not be retrieved.');
        }

        return createdOrUpdatedRemoteRdp;
    }
}
