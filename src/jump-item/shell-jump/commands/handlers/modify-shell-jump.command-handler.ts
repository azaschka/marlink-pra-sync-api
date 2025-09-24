import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyShellJumpCommand as BTModifyShellJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/commands';
import { ShellJumpModifiedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/dtos/outputs';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { ShellJumpModificationFailedEvent, ShellJumpModifiedEvent } from '../../events';
import {
    mapFromBTJumpGroupType,
    mapFromBTShellJumpProtocolType,
    mapFromBTShellJumpTerminalType,
    mapToBTJumpGroupType,
    mapToBTShellJumpProtocolType,
    mapToBTShellJumpTerminalType,
} from '../../mappers';
import { ShellJump } from '../../models';
import { ShellJumpEntity } from '../../repositories/entities';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { ModifyShellJumpCommand } from '../modify-shell-jump.command';

@CommandHandler(ModifyShellJumpCommand)
export class ModifyShellJumpCommandHandler implements ICommandHandler<ModifyShellJumpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly shellJumpRepositoryService: ShellJumpRepositoryService,
    ) {}

    public async execute(command: ModifyShellJumpCommand): Promise<ShellJump> {
        const btShellJump = await this.modifyBTShellJump(command);
        const shellJumpEntity = this.createShellJumpEntity(btShellJump);

        try {
            const updatedShellJump = await this.updateShellJump(command.tenantId, shellJumpEntity);

            this.eventBus.publish(
                new ShellJumpModifiedEvent(command.transactionId, {
                    shellJump: updatedShellJump,
                    tenantId: command.tenantId,
                }),
            );

            return updatedShellJump;
        } catch (error) {
            this.eventBus.publish(
                new ShellJumpModificationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    shellJump: shellJumpEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async modifyBTShellJump(command: ModifyShellJumpCommand) {
        return await this.commandBus.execute<BTModifyShellJumpCommand, ShellJumpModifiedDtoOutput>(
            new BTModifyShellJumpCommand(
                command.transactionId,
                command.id,
                command.name,
                command.jumpointId,
                command.hostname,
                command.protocolType ? mapToBTShellJumpProtocolType(command.protocolType) : undefined,
                command.port,
                command.jumpGroupId,
                command.jumpGroupType ? mapToBTJumpGroupType(command.jumpGroupType) : undefined,
                command.terminalType ? mapToBTShellJumpTerminalType(command.terminalType) : undefined,
                command.keepAliveIdleSessionInSeconds,
                command.tag,
                command.comments,
                command.jumpPolicyId,
                command.username,
                command.sessionPolicyId,
            ),
        );
    }

    private createShellJumpEntity(btShellJump: ShellJumpModifiedDtoOutput) {
        return ShellJumpEntity.create(
            btShellJump.id,
            btShellJump.name,
            btShellJump.jumpointId,
            btShellJump.hostname,
            mapFromBTShellJumpProtocolType(btShellJump.protocol),
            btShellJump.port,
            btShellJump.jumpGroupId,
            btShellJump.jumpGroupType ? mapFromBTJumpGroupType(btShellJump.jumpGroupType) : undefined,
            btShellJump.terminal ? mapFromBTShellJumpTerminalType(btShellJump.terminal) : undefined,
            btShellJump.keepAlive,
            btShellJump.tag,
            btShellJump.comments,
            btShellJump.jumpPolicyId,
            btShellJump.username,
            btShellJump.sessionPolicyId,
        );
    }

    private async updateShellJump(tenantId: number, shellJumpEntity: ShellJumpEntity) {
        await this.shellJumpRepositoryService.createOrUpdateById(tenantId, shellJumpEntity);

        const createdOrUpdatedShellJump = await this.shellJumpRepositoryService.findOneById(
            tenantId,
            shellJumpEntity.id,
        );

        if (!createdOrUpdatedShellJump) {
            throw new Error('Shell jump has been created or updated but could not be retrieved.');
        }

        return createdOrUpdatedShellJump;
    }
}
