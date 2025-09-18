import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyProtocolTunnelJumpCommand as BTModifyProtocolTunnelJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/commands';
import { ProtocolTunnelJumpModifiedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/dtos/outputs';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { ProtocolTunnelJumpModificationFailedEvent, ProtocolTunnelJumpModifiedEvent } from '../../events';
import { mapFromBTJumpGroupType, mapFromBTTunnelType, mapToBTJumpGroupType, mapToBTTunnelType } from '../../mappers';
import { ProtocolTunnelJump } from '../../models';
import { ProtocolTunnelJumpEntity } from '../../repositories/entities';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { ModifyProtocolTunnelJumpCommand } from '../modify-protocol-tunnel-jump.command';

@CommandHandler(ModifyProtocolTunnelJumpCommand)
export class ModifyProtocolTunnelJumpCommandHandler implements ICommandHandler<ModifyProtocolTunnelJumpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService,
    ) {}

    public async execute(command: ModifyProtocolTunnelJumpCommand): Promise<ProtocolTunnelJump> {
        const btProtocolTunnelJump = await this.modifyBTProtocolTunnelJump(command);
        const protocolTunnelJumpEntity = this.createProtocolTunnelJumpEntity(btProtocolTunnelJump);

        try {
            const updatedProtocolTunnelJump = await this.updateProtocolTunnelJump(
                command.tenantId,
                protocolTunnelJumpEntity,
            );

            this.eventBus.publish(
                new ProtocolTunnelJumpModifiedEvent(command.transactionId, {
                    protocolTunnelJump: updatedProtocolTunnelJump,
                }),
            );

            return updatedProtocolTunnelJump;
        } catch (error) {
            this.eventBus.publish(
                new ProtocolTunnelJumpModificationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    protocolTunnelJump: protocolTunnelJumpEntity,
                }),
            );

            throw error;
        }
    }

    private async modifyBTProtocolTunnelJump(command: ModifyProtocolTunnelJumpCommand) {
        return await this.commandBus.execute<BTModifyProtocolTunnelJumpCommand, ProtocolTunnelJumpModifiedDtoOutput>(
            new BTModifyProtocolTunnelJumpCommand(
                command.transactionId,
                command.id,
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

    private createProtocolTunnelJumpEntity(btProtocolTunnelJump: ProtocolTunnelJumpModifiedDtoOutput) {
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

    private async updateProtocolTunnelJump(tenantId: number, protocolTunnelJumpEntity: ProtocolTunnelJumpEntity) {
        await this.protocolTunnelJumpRepositoryService.createOrUpdateById(tenantId, protocolTunnelJumpEntity);

        const createdOrUpdatedProtocolTunnelJump = await this.protocolTunnelJumpRepositoryService.findOneById(
            tenantId,
            protocolTunnelJumpEntity.id,
        );

        if (!createdOrUpdatedProtocolTunnelJump) {
            throw new Error('Protocol tunnel jump has been created or updated but could not be retrieved.');
        }

        return createdOrUpdatedProtocolTunnelJump;
    }
}
