import { ConflictException } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateShellJumpCommand as BTCreateShellJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/commands';
import { ShellJumpCreatedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/dtos/outputs';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { ShellJumpCreatedEvent, ShellJumpCreationFailedEvent } from '../../events';
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
import { CreateShellJumpCommand } from '../create-shell-jump.command';

@CommandHandler(CreateShellJumpCommand)
export class CreateShellJumpCommandHandler implements ICommandHandler<CreateShellJumpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly shellJumpRepositoryService: ShellJumpRepositoryService,
    ) {}

    public async execute(command: CreateShellJumpCommand): Promise<ShellJump> {
        await this.validateShellJumpDoesNotExist(command.name, command.jumpGroupId, command.tag);

        const btShellJump = await this.createBTShellJump(command);
        const shellJumpEntity = this.createShellJumpEntity(btShellJump);

        try {
            const createdShellJump = await this.shellJumpRepositoryService.create(shellJumpEntity);

            this.eventBus.publish(
                new ShellJumpCreatedEvent(command.transactionId, {
                    shellJump: createdShellJump,
                }),
            );

            return createdShellJump;
        } catch (error) {
            this.eventBus.publish(
                new ShellJumpCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    shellJump: shellJumpEntity,
                }),
            );

            throw error;
        }
    }

    private async validateShellJumpDoesNotExist(name: string, jumpGroupId: number, tag?: string) {
        const existingShellJump = await this.shellJumpRepositoryService.findOneBy({
            name,
            jumpGroupId,
            tag,
        });

        if (existingShellJump) {
            throw new ConflictException(`Shell Jump "${name}" with tag "${tag ?? ''}" already exists.`);
        }
    }

    private async createBTShellJump(command: CreateShellJumpCommand) {
        return await this.commandBus.execute<BTCreateShellJumpCommand, ShellJumpCreatedDtoOutput>(
            new BTCreateShellJumpCommand(
                command.transactionId,
                command.name,
                command.jumpointId,
                command.hostname,
                mapToBTShellJumpProtocolType(command.protocolType),
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

    private createShellJumpEntity(btShellJump: ShellJumpCreatedDtoOutput) {
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
}
