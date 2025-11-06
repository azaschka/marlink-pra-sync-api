import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { CopyShellJumpDtoInput } from '../../dtos/inputs';
import { ShellJumpCopiedDtoOutput } from '../../dtos/outputs';
import { CopyShellJumpCommand } from '../copy-shell-jump.command';

@CommandHandler(CopyShellJumpCommand)
export class CopyShellJumpCommandHandler implements ICommandHandler<CopyShellJumpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CopyShellJumpCommand): Promise<ShellJumpCopiedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpItem.shellJump.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.config.jumpItem.shellJump.copy,
        );

        return await this.httpClientService.post<ShellJumpCopiedDtoOutput, ShellJumpCopiedDtoOutput>(
            ShellJumpCopiedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            CopyShellJumpDtoInput.create(command.name, command.jumpGroupId, command.jumpGroupType),
        );
    }
}
