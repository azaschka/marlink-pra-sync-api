import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyRemoteVncCommand as BTModifyRemoteVncCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/commands';
import { RemoteVncModifiedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/dtos/outputs';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteVncModificationFailedEvent, RemoteVncModifiedEvent } from '../../events';
import { mapFromBTJumpGroupType, mapToBTJumpGroupType } from '../../mappers';
import { RemoteVnc } from '../../models';
import { RemoteVncEntity } from '../../repositories/entities';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { ModifyRemoteVncCommand } from '../modify-remote-vnc.command';

@CommandHandler(ModifyRemoteVncCommand)
export class ModifyRemoteVncCommandHandler implements ICommandHandler<ModifyRemoteVncCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly remoteVncRepositoryService: RemoteVncRepositoryService,
    ) {}

    public async execute(command: ModifyRemoteVncCommand): Promise<RemoteVnc> {
        const btRemoteVnc = await this.modifyBTRemoteVnc(command);
        const remoteVncEntity = this.createRemoteVncEntity(btRemoteVnc);

        try {
            const updatedRemoteVnc = await this.updateRemoteVnc(command.tenantId, remoteVncEntity);

            this.eventBus.publish(
                new RemoteVncModifiedEvent(command.transactionId, {
                    remoteVnc: updatedRemoteVnc,
                    tenantId: command.tenantId,
                }),
            );

            return updatedRemoteVnc;
        } catch (error) {
            this.eventBus.publish(
                new RemoteVncModificationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    remoteVnc: remoteVncEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async modifyBTRemoteVnc(command: ModifyRemoteVncCommand) {
        return await this.commandBus.execute<BTModifyRemoteVncCommand, RemoteVncModifiedDtoOutput>(
            new BTModifyRemoteVncCommand(
                command.transactionId,
                command.id,
                command.name,
                command.jumpointId,
                command.hostname,
                command.port,
                command.jumpGroupId,
                command.jumpGroupType ? mapToBTJumpGroupType(command.jumpGroupType) : undefined,
                command.tag,
                command.comments,
                command.jumpPolicyId,
                command.sessionPolicyId,
            ),
        );
    }

    private createRemoteVncEntity(btRemoteVnc: RemoteVncModifiedDtoOutput) {
        return RemoteVncEntity.create(
            btRemoteVnc.id,
            btRemoteVnc.name,
            btRemoteVnc.jumpointId,
            btRemoteVnc.hostname,
            btRemoteVnc.port,
            btRemoteVnc.jumpGroupId,
            btRemoteVnc.jumpGroupType ? mapFromBTJumpGroupType(btRemoteVnc.jumpGroupType) : undefined,
            btRemoteVnc.tag,
            btRemoteVnc.comments,
            btRemoteVnc.jumpPolicyId,
            btRemoteVnc.sessionPolicyId,
        );
    }

    private async updateRemoteVnc(tenantId: number, remoteVncEntity: RemoteVncEntity) {
        await this.remoteVncRepositoryService.createOrUpdateById(tenantId, remoteVncEntity);

        const createdOrUpdatedRemoteVnc = await this.remoteVncRepositoryService.findOneById(
            tenantId,
            remoteVncEntity.id,
        );

        if (!createdOrUpdatedRemoteVnc) {
            throw new Error('Remote vnc has been created or updated but could not be retrieved.');
        }

        return createdOrUpdatedRemoteVnc;
    }
}
