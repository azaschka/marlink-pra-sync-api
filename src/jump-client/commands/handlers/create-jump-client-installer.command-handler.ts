import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateJumpClientInstallerCommand as BTCreateJumpClientInstallerCommand } from '../../../beyondtrust-pra-conf-api/jump-client/commands';
import { JumpClientInstallerCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpClientInstallerCreatedEvent, JumpClientInstallerCreationFailedEvent } from '../../events';
import {
    mapFromBTJumpClientConnectionType,
    mapFromBTJumpClientGroupType,
    mapFromBTJumpClientInstallerKeyInfo,
    mapToBTJumpClientConnectionType,
    mapToBTJumpClientGroupType,
} from '../../mappers';
import { JumpClientInstaller } from '../../models';
import { JumpClientInstallerEntity } from '../../repositories/entities';
import { JumpClientInstallerRepositoryService } from '../../repositories/services/jump-client-installer-repository.service';
import { CreateJumpClientInstallerCommand } from '../create-jump-client-installer.command';

@CommandHandler(CreateJumpClientInstallerCommand)
export class CreateJumpClientInstallerCommandHandler implements ICommandHandler<CreateJumpClientInstallerCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService,
    ) {}

    public async execute(command: CreateJumpClientInstallerCommand): Promise<JumpClientInstaller> {
        const btJumpClientInstaller = await this.createBTJumpClientInstaller(command);
        const jumpClientInstallerEntity = this.createJumpClientInstallerEntity(btJumpClientInstaller);

        try {
            const createdJumpClientInstaller =
                await this.jumpClientInstallerRepositoryService.create(jumpClientInstallerEntity);

            this.eventBus.publish(
                new JumpClientInstallerCreatedEvent(command.transactionId, {
                    jumpClientInstaller: createdJumpClientInstaller,
                }),
            );

            return createdJumpClientInstaller;
        } catch (error) {
            this.eventBus.publish(
                new JumpClientInstallerCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    jumpClientInstaller: jumpClientInstallerEntity,
                }),
            );

            throw error;
        }
    }

    private async createBTJumpClientInstaller(command: CreateJumpClientInstallerCommand) {
        return await this.commandBus.execute<BTCreateJumpClientInstallerCommand, JumpClientInstallerCreatedDtoOutput>(
            new BTCreateJumpClientInstallerCommand(
                command.transactionId,
                command.jumpGroupId,
                command.name,
                command.jumpGroupType ? mapToBTJumpClientGroupType(command.jumpGroupType) : undefined,
                command.jumpPolicyId,
                command.tag,
                command.connectionType ? mapToBTJumpClientConnectionType(command.connectionType) : undefined,
                command.sessionPolicyId,
                command.comments,
                command.validDurationInMinutes,
                command.shouldElevateInstall,
                command.shouldElevatePrompt,
                command.canOverrideJumpGroup,
                command.canOverrideJumpPolicy,
                command.canOverrideName,
                command.canOverrideTag,
                command.canOverrideComments,
                command.canOverrideSessionPolicy,
                command.jumpointProxy,
            ),
        );
    }

    private createJumpClientInstallerEntity(btJumpClient: JumpClientInstallerCreatedDtoOutput) {
        return JumpClientInstallerEntity.create(
            btJumpClient.id,
            btJumpClient.jumpGroupId,
            btJumpClient.jumpGroupType ? mapFromBTJumpClientGroupType(btJumpClient.jumpGroupType) : undefined,
            btJumpClient.name,
            btJumpClient.tag,
            btJumpClient.comments,
            btJumpClient.jumpPolicyId,
            btJumpClient.sessionPolicyId,
            btJumpClient.connectionType ? mapFromBTJumpClientConnectionType(btJumpClient.connectionType) : undefined,
            btJumpClient.expirationTimestamp,
            btJumpClient.maxOfflineMinutes,
            btJumpClient.elevateInstall,
            btJumpClient.elevatePrompt,
            btJumpClient.allowOverrideJumpGroup,
            btJumpClient.allowOverrideJumpPolicy,
            btJumpClient.allowOverrideName,
            btJumpClient.allowOverrideTag,
            btJumpClient.allowOverrideComments,
            btJumpClient.allowOverrideSessionPolicy,
            btJumpClient.installerId,
            btJumpClient.keyInfo ? mapFromBTJumpClientInstallerKeyInfo(btJumpClient.keyInfo) : undefined,
            btJumpClient.jumpointProxy,
        );
    }
}
