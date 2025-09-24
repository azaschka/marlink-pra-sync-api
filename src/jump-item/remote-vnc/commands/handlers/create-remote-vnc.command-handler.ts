import { ConflictException } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateRemoteVncCommand as BTCreateRemoteVncCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/commands';
import { RemoteVncCreatedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/dtos/outputs';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteVncCreatedEvent, RemoteVncCreationFailedEvent } from '../../events';
import { mapFromBTJumpGroupType, mapToBTJumpGroupType } from '../../mappers';
import { RemoteVnc } from '../../models';
import { RemoteVncEntity } from '../../repositories/entities';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { CreateRemoteVncCommand } from '../create-remote-vnc.command';

@CommandHandler(CreateRemoteVncCommand)
export class CreateRemoteVncCommandHandler implements ICommandHandler<CreateRemoteVncCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly remoteVncRepositoryService: RemoteVncRepositoryService,
    ) {}

    public async execute(command: CreateRemoteVncCommand): Promise<RemoteVnc> {
        await this.validateRemoteVncDoesNotExist(command.tenantId, command.name, command.jumpGroupId, command.tag);

        const btRemoteVnc = await this.createBTRemoteVnc(command);
        const remoteVncEntity = this.createRemoteVncEntity(btRemoteVnc);

        try {
            const createdRemoteVnc = await this.remoteVncRepositoryService.create(command.tenantId, remoteVncEntity);

            this.eventBus.publish(
                new RemoteVncCreatedEvent(command.transactionId, {
                    remoteVnc: createdRemoteVnc,
                    tenantId: command.tenantId,
                }),
            );

            return createdRemoteVnc;
        } catch (error) {
            this.eventBus.publish(
                new RemoteVncCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    remoteVnc: remoteVncEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async validateRemoteVncDoesNotExist(tenantId: number, name: string, jumpGroupId: number, tag?: string) {
        const existingRemoteVnc = await this.remoteVncRepositoryService.findOneBy(tenantId, {
            name,
            jumpGroupId,
            tag,
        });

        if (existingRemoteVnc) {
            throw new ConflictException(`Remote VNC "${name}" with tag "${tag ?? ''}" already exists.`);
        }
    }

    private async createBTRemoteVnc(command: CreateRemoteVncCommand) {
        return await this.commandBus.execute<BTCreateRemoteVncCommand, RemoteVncCreatedDtoOutput>(
            new BTCreateRemoteVncCommand(
                command.transactionId,
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

    private createRemoteVncEntity(btRemoteVnc: RemoteVncCreatedDtoOutput) {
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
}
