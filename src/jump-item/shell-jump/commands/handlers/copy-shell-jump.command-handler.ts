import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CopyShellJumpCommand as BTCopyShellJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/commands';
import {
    ShellJumpCopiedDtoOutput,
    ShellJumpRetrievedDtoOutput,
} from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/dtos/outputs';
import { RetrieveShellJumpByIdQuery as BTRetrieveShellJumpByIdQuery } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/queries';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { ShellJumpCopiedEvent, ShellJumpCopyFailedEvent } from '../../events';
import {
    mapFromBTJumpGroupType,
    mapFromBTShellJumpProtocolType,
    mapFromBTShellJumpTerminalType,
    mapToBTJumpGroupType,
} from '../../mappers';
import { ShellJump } from '../../models';
import { ShellJumpEntity } from '../../repositories/entities';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { CopyShellJumpCommand } from '../copy-shell-jump.command';

@CommandHandler(CopyShellJumpCommand)
export class CopyShellJumpCommandHandler implements ICommandHandler<CopyShellJumpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        private readonly shellJumpRepositoryService: ShellJumpRepositoryService,
    ) {}

    public async execute(command: CopyShellJumpCommand): Promise<ShellJump> {
        const btShellJump = await this.copyBTShellJump(command);
        const shellJumpEntity = this.createShellJumpEntity(btShellJump);

        try {
            const createdShellJump = await this.shellJumpRepositoryService.create(command.tenantId, shellJumpEntity);

            this.eventBus.publish(
                new ShellJumpCopiedEvent(command.transactionId, {
                    shellJump: createdShellJump,
                    tenantId: command.tenantId,
                }),
            );

            return createdShellJump;
        } catch (error) {
            this.eventBus.publish(
                new ShellJumpCopyFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    shellJump: shellJumpEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async copyBTShellJump(command: CopyShellJumpCommand) {
        const response = await this.commandBus.execute<BTCopyShellJumpCommand, ShellJumpCopiedDtoOutput>(
            new BTCopyShellJumpCommand(
                command.transactionId,
                command.tenantId,
                command.id,
                command.jumpGroupId,
                mapToBTJumpGroupType(command.jumpGroupType),
                command.name,
            ),
        );

        return await this.queryBus.execute<BTRetrieveShellJumpByIdQuery, ShellJumpRetrievedDtoOutput>(
            new BTRetrieveShellJumpByIdQuery(command.transactionId, command.tenantId, response.destId),
        );
    }

    private createShellJumpEntity(btShellJump: ShellJumpRetrievedDtoOutput) {
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
