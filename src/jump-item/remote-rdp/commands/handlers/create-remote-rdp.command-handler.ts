import { ConflictException } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateRemoteRdpCommand as BTCreateRemoteRdpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/commands';
import { RemoteRdpCreatedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/dtos/outputs';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteRdpCreatedEvent, RemoteRdpCreationFailedEvent } from '../../events';
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
import { CreateRemoteRdpCommand } from '../create-remote-rdp.command';

@CommandHandler(CreateRemoteRdpCommand)
export class CreateRemoteRdpCommandHandler implements ICommandHandler<CreateRemoteRdpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly remoteRdpRepositoryService: RemoteRdpRepositoryService,
    ) {}

    public async execute(command: CreateRemoteRdpCommand): Promise<RemoteRdp> {
        await this.validateRemoteRdpDoesNotExist(command.tenantId, command.name, command.jumpGroupId, command.tag);

        const btRemoteRdp = await this.createBTRemoteRdp(command);
        const remoteRdpEntity = this.createRemoteRdpEntity(btRemoteRdp);

        try {
            const createdRemoteRdp = await this.remoteRdpRepositoryService.create(command.tenantId, remoteRdpEntity);

            this.eventBus.publish(
                new RemoteRdpCreatedEvent(command.transactionId, {
                    remoteRdp: createdRemoteRdp,
                }),
            );

            return createdRemoteRdp;
        } catch (error) {
            this.eventBus.publish(
                new RemoteRdpCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    remoteRdp: remoteRdpEntity,
                }),
            );

            throw error;
        }
    }

    private async validateRemoteRdpDoesNotExist(tenantId: number, name: string, jumpGroupId: number, tag?: string) {
        const existingRemoteRdp = await this.remoteRdpRepositoryService.findOneBy(tenantId, {
            name,
            jumpGroupId,
            tag,
        });

        if (existingRemoteRdp) {
            throw new ConflictException(`Remote RDP "${name}" with tag "${tag ?? ''}" already exists.`);
        }
    }

    private async createBTRemoteRdp(command: CreateRemoteRdpCommand) {
        return await this.commandBus.execute<BTCreateRemoteRdpCommand, RemoteRdpCreatedDtoOutput>(
            new BTCreateRemoteRdpCommand(
                command.transactionId,
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

    private createRemoteRdpEntity(btRemoteRdp: RemoteRdpCreatedDtoOutput) {
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
}
