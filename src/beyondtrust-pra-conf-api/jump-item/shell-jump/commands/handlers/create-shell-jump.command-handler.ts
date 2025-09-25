import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { CreateShellJumpDtoInput } from '../../dtos/inputs';
import { ShellJumpCreatedDtoOutput } from '../../dtos/outputs';
import { CreateShellJumpCommand } from '../create-shell-jump.command';

@CommandHandler(CreateShellJumpCommand)
export class CreateShellJumpCommandHandler implements ICommandHandler<CreateShellJumpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateShellJumpCommand): Promise<ShellJumpCreatedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpItem.shellJump.path,
        );

        return await this.httpClientService.post<ShellJumpCreatedDtoOutput, ShellJumpCreatedDtoOutput>(
            ShellJumpCreatedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            CreateShellJumpDtoInput.create(
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
