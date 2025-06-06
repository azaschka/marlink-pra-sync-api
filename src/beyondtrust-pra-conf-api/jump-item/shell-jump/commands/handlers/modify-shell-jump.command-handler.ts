import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ModifyShellJumpDtoInput } from '../../dtos/inputs';
import { ShellJumpModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyShellJumpCommand } from '../modify-shell-jump.command';

@CommandHandler(ModifyShellJumpCommand)
export class ModifyShellJumpCommandHandler implements ICommandHandler<ModifyShellJumpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ModifyShellJumpCommand): Promise<ShellJumpModifiedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.shellJump.path,
            command.id.toString(),
        );

        return await this.httpClientService.patch<ShellJumpModifiedDtoOutput, ShellJumpModifiedDtoOutput>(
            ShellJumpModifiedDtoOutput,
            url,
            ModifyShellJumpDtoInput.create(
                command.name,
                command.jumpointId,
                command.hostname,
                command.protocol,
                command.port,
                command.jumpGroupId,
                command.jumpGroupType,
                command.terminal,
                command.keepAlive,
                command.tag,
                command.comments,
                command.jumpPolicyId,
                command.username,
                command.sessionPolicyId,
            ),
        );
    }
}
