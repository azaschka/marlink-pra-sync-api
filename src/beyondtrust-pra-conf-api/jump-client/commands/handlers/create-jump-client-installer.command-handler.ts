import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { CreateJumpClientInstallerDtoInput } from '../../dtos/inputs';
import { JumpClientInstallerCreatedDtoOutput } from '../../dtos/outputs';
import { CreateJumpClientInstallerCommand } from '../create-jump-client-installer.command';

@CommandHandler(CreateJumpClientInstallerCommand)
export class CreateJumpClientInstallerCommandHandler implements ICommandHandler<CreateJumpClientInstallerCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateJumpClientInstallerCommand): Promise<JumpClientInstallerCreatedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpClient.path,
            this.appConfigService.beyondTrust.api.jumpClient.installer.path,
        );

        return await this.httpClientService.post<
            JumpClientInstallerCreatedDtoOutput,
            JumpClientInstallerCreatedDtoOutput
        >(
            JumpClientInstallerCreatedDtoOutput,
            url,
            CreateJumpClientInstallerDtoInput.create(
                command.jumpGroupId,
                command.name,
                command.jumpGroupType,
                command.jumpPolicyId,
                command.tag,
                command.connectionType,
                command.sessionPolicyId,
                command.comments,
                command.validDuration,
                command.elevateInstall,
                command.elevatePrompt,
                command.allowOverrideJumpGroup,
                command.allowOverrideJumpPolicy,
                command.allowOverrideName,
                command.allowOverrideTag,
                command.allowOverrideComments,
                command.allowOverrideSessionPolicy,
                command.jumpointProxy,
            ),
        );
    }
}
