import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyWebJumpCommand as BTModifyWebJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/commands';
import { WebJumpModifiedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/dtos/outputs';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { WebJumpModificationFailedEvent, WebJumpModifiedEvent } from '../../events';
import {
    mapFromBTJumpGroupType,
    mapFromBTWebJumpUsernameFormatType,
    mapToBTJumpGroupType,
    mapToBTWebJumpUsernameFormatType,
} from '../../mappers';
import { WebJump } from '../../models';
import { WebJumpEntity } from '../../repositories/entities';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { ModifyWebJumpCommand } from '../modify-web-jump.command';

@CommandHandler(ModifyWebJumpCommand)
export class ModifyWebJumpCommandHandler implements ICommandHandler<ModifyWebJumpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly webJumpRepositoryService: WebJumpRepositoryService,
    ) {}

    public async execute(command: ModifyWebJumpCommand): Promise<WebJump> {
        const btWebJump = await this.modifyBTWebJump(command);
        const webJumpEntity = this.createWebJumpEntity(btWebJump);

        try {
            const updatedWebJump = await this.updateWebJump(webJumpEntity);

            this.eventBus.publish(
                new WebJumpModifiedEvent(command.transactionId, {
                    webJump: updatedWebJump,
                }),
            );

            return updatedWebJump;
        } catch (error) {
            this.eventBus.publish(
                new WebJumpModificationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    webJump: webJumpEntity,
                }),
            );

            throw error;
        }
    }

    private async modifyBTWebJump(command: ModifyWebJumpCommand) {
        return await this.commandBus.execute<BTModifyWebJumpCommand, WebJumpModifiedDtoOutput>(
            new BTModifyWebJumpCommand(
                command.transactionId,
                command.id,
                command.name,
                command.jumpointId,
                command.url,
                command.jumpGroupId,
                command.jumpGroupType ? mapToBTJumpGroupType(command.jumpGroupType) : undefined,
                command.usernameFormatType ? mapToBTWebJumpUsernameFormatType(command.usernameFormatType) : undefined,
                command.mustVerifyCertificate,
                command.authenticationTimeoutInSeconds,
                command.tag,
                command.comments,
                command.jumpPolicyId,
                command.usernameField,
                command.passwordField,
                command.submitField,
                command.sessionPolicyId,
            ),
        );
    }

    private createWebJumpEntity(btWebJump: WebJumpModifiedDtoOutput) {
        return WebJumpEntity.create(
            btWebJump.id,
            btWebJump.name,
            btWebJump.jumpointId,
            btWebJump.url,
            btWebJump.jumpGroupId,
            btWebJump.jumpGroupType ? mapFromBTJumpGroupType(btWebJump.jumpGroupType) : undefined,
            btWebJump.usernameFormat ? mapFromBTWebJumpUsernameFormatType(btWebJump.usernameFormat) : undefined,
            btWebJump.verifyCertificate,
            btWebJump.authenticationTimeout,
            btWebJump.tag,
            btWebJump.comments,
            btWebJump.jumpPolicyId,
            btWebJump.usernameField,
            btWebJump.passwordField,
            btWebJump.submitField,
            btWebJump.sessionPolicyId,
        );
    }

    private async updateWebJump(webJumpEntity: WebJumpEntity) {
        await this.webJumpRepositoryService.createOrUpdateById(webJumpEntity);

        const createdOrUpdatedWebJump = await this.webJumpRepositoryService.findOneById(webJumpEntity.id);

        if (!createdOrUpdatedWebJump) {
            throw new Error('Web jump has been created or updated but could not be retrieved.');
        }

        return createdOrUpdatedWebJump;
    }
}
