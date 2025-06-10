import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateWebJumpCommand as BTCreateWebJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/commands';
import { WebJumpCreatedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/dtos/outputs';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { WebJumpCreatedEvent, WebJumpCreationFailedEvent } from '../../events';
import {
    mapFromBTJumpGroupType,
    mapFromBTWebJumpUsernameFormatType,
    mapToBTJumpGroupType,
    mapToBTWebJumpUsernameFormatType,
} from '../../mappers';
import { WebJump } from '../../models';
import { WebJumpEntity } from '../../repositories/entities';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { CreateWebJumpCommand } from '../create-web-jump.command';

@CommandHandler(CreateWebJumpCommand)
export class CreateWebJumpCommandHandler implements ICommandHandler<CreateWebJumpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly webJumpRepositoryService: WebJumpRepositoryService,
    ) {}

    public async execute(command: CreateWebJumpCommand): Promise<WebJump> {
        const btWebJump = await this.createBTWebJump(command);
        const webJumpEntity = this.createWebJumpEntity(btWebJump);

        try {
            const createdWebJump = await this.webJumpRepositoryService.create(webJumpEntity);

            this.eventBus.publish(
                new WebJumpCreatedEvent(command.transactionId, {
                    webJump: createdWebJump,
                }),
            );

            return createdWebJump;
        } catch (error) {
            this.eventBus.publish(
                new WebJumpCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    webJump: webJumpEntity,
                }),
            );

            throw error;
        }
    }

    private async createBTWebJump(command: CreateWebJumpCommand) {
        return await this.commandBus.execute<BTCreateWebJumpCommand, WebJumpCreatedDtoOutput>(
            new BTCreateWebJumpCommand(
                command.transactionId,
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

    private createWebJumpEntity(btWebJump: WebJumpCreatedDtoOutput) {
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
}
