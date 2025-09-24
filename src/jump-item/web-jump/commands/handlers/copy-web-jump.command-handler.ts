import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CopyWebJumpCommand as BTCopyWebJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/commands';
import {
    WebJumpCopiedDtoOutput,
    WebJumpRetrievedDtoOutput,
} from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/dtos/outputs';
import { RetrieveWebJumpByIdQuery as BTRetrieveWebJumpByIdQuery } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/queries';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { WebJumpCopiedEvent, WebJumpCopyFailedEvent } from '../../events';
import { mapFromBTJumpGroupType, mapFromBTWebJumpUsernameFormatType, mapToBTJumpGroupType } from '../../mappers';
import { WebJump } from '../../models';
import { WebJumpEntity } from '../../repositories/entities';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { CopyWebJumpCommand } from '../copy-web-jump.command';

@CommandHandler(CopyWebJumpCommand)
export class CopyWebJumpCommandHandler implements ICommandHandler<CopyWebJumpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        private readonly webJumpRepositoryService: WebJumpRepositoryService,
    ) {}

    public async execute(command: CopyWebJumpCommand): Promise<WebJump> {
        const btWebJump = await this.copyBTWebJump(command);
        const webJumpEntity = this.createWebJumpEntity(btWebJump);

        try {
            const createdWebJump = await this.webJumpRepositoryService.create(command.tenantId, webJumpEntity);

            this.eventBus.publish(
                new WebJumpCopiedEvent(command.transactionId, {
                    webJump: createdWebJump,
                    tenantId: command.tenantId,
                }),
            );

            return createdWebJump;
        } catch (error) {
            this.eventBus.publish(
                new WebJumpCopyFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    webJump: webJumpEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async copyBTWebJump(command: CopyWebJumpCommand) {
        const response = await this.commandBus.execute<BTCopyWebJumpCommand, WebJumpCopiedDtoOutput>(
            new BTCopyWebJumpCommand(
                command.transactionId,
                command.id,
                command.jumpGroupId,
                mapToBTJumpGroupType(command.jumpGroupType),
                command.name,
            ),
        );

        return await this.queryBus.execute<BTRetrieveWebJumpByIdQuery, WebJumpRetrievedDtoOutput>(
            new BTRetrieveWebJumpByIdQuery(command.transactionId, response.destId),
        );
    }

    private createWebJumpEntity(btWebJump: WebJumpRetrievedDtoOutput) {
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
