import { ConflictException } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateProtocolTunnelJumpCommand as BTCreateProtocolTunnelJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/commands';
import { ProtocolTunnelJumpCreatedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/dtos/outputs';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { ProtocolTunnelJumpCreatedEvent, ProtocolTunnelJumpCreationFailedEvent } from '../../events';
import { mapFromBTJumpGroupType, mapFromBTTunnelType, mapToBTJumpGroupType, mapToBTTunnelType } from '../../mappers';
import { ProtocolTunnelJump } from '../../models';
import { ProtocolTunnelJumpEntity } from '../../repositories/entities';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { CreateProtocolTunnelJumpCommand } from '../create-protocol-tunnel-jump.command';

@CommandHandler(CreateProtocolTunnelJumpCommand)
export class CreateProtocolTunnelJumpCommandHandler implements ICommandHandler<CreateProtocolTunnelJumpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService,
    ) {}

    public async execute(command: CreateProtocolTunnelJumpCommand): Promise<ProtocolTunnelJump> {
        await this.validateProtocolTunnelJumpDoesNotExist(
            command.tenantId,
            command.name,
            command.jumpGroupId,
            command.tag,
        );

        const btProtocolTunnelJump = await this.createBTProtocolTunnelJump(command);
        const protocolTunnelJumpEntity = this.createProtocolTunnelJumpEntity(btProtocolTunnelJump);

        try {
            const createdProtocolTunnelJump = await this.protocolTunnelJumpRepositoryService.create(
                command.tenantId,
                protocolTunnelJumpEntity,
            );

            this.eventBus.publish(
                new ProtocolTunnelJumpCreatedEvent(command.transactionId, {
                    protocolTunnelJump: createdProtocolTunnelJump,
                }),
            );

            return createdProtocolTunnelJump;
        } catch (error) {
            this.eventBus.publish(
                new ProtocolTunnelJumpCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    protocolTunnelJump: protocolTunnelJumpEntity,
                }),
            );

            throw error;
        }
    }

    private async validateProtocolTunnelJumpDoesNotExist(
        tenantId: number,
        name: string,
        jumpGroupId: number,
        tag?: string,
    ) {
        const existingProtocolTunnelJump = await this.protocolTunnelJumpRepositoryService.findOneBy(tenantId, {
            name,
            jumpGroupId,
            tag,
        });

        if (existingProtocolTunnelJump) {
            throw new ConflictException(`Protocol Tunnel Jump "${name}" with tag "${tag ?? ''}" already exists.`);
        }
    }

    private async createBTProtocolTunnelJump(command: CreateProtocolTunnelJumpCommand) {
        return await this.commandBus.execute<BTCreateProtocolTunnelJumpCommand, ProtocolTunnelJumpCreatedDtoOutput>(
            new BTCreateProtocolTunnelJumpCommand(
                command.transactionId,
                command.name,
                command.jumpointId,
                command.hostname,
                command.jumpGroupId,
                command.jumpGroupType ? mapToBTJumpGroupType(command.jumpGroupType) : undefined,
                command.tag,
                command.comments,
                command.jumpPolicyId,
                command.sessionPolicyId,
                command.tunnelListenAddress,
                command.tunnelDefinitions,
                command.tunnelType ? mapToBTTunnelType(command.tunnelType) : undefined,
                command.username,
                command.database,
                command.url,
                command.caCertificates,
            ),
        );
    }

    private createProtocolTunnelJumpEntity(btProtocolTunnelJump: ProtocolTunnelJumpCreatedDtoOutput) {
        return ProtocolTunnelJumpEntity.create(
            btProtocolTunnelJump.id,
            btProtocolTunnelJump.name,
            btProtocolTunnelJump.jumpointId,
            btProtocolTunnelJump.hostname,
            btProtocolTunnelJump.jumpGroupId,
            btProtocolTunnelJump.jumpGroupType ? mapFromBTJumpGroupType(btProtocolTunnelJump.jumpGroupType) : undefined,
            btProtocolTunnelJump.tag,
            btProtocolTunnelJump.comments,
            btProtocolTunnelJump.jumpPolicyId,
            btProtocolTunnelJump.sessionPolicyId,
            btProtocolTunnelJump.tunnelListenAddress,
            btProtocolTunnelJump.tunnelDefinitions,
            btProtocolTunnelJump.tunnelType ? mapFromBTTunnelType(btProtocolTunnelJump.tunnelType) : undefined,
            btProtocolTunnelJump.username,
            btProtocolTunnelJump.database,
            btProtocolTunnelJump.url,
            btProtocolTunnelJump.caCertificates,
        );
    }
}
