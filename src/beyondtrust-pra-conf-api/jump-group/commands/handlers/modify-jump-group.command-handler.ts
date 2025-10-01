import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { ModifyJumpGroupDtoInput } from '../../dtos/inputs';
import { JumpGroupModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyJumpGroupCommand } from '../modify-jump-group.command';

@CommandHandler(ModifyJumpGroupCommand)
export class ModifyJumpGroupCommandHandler implements ICommandHandler<ModifyJumpGroupCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ModifyJumpGroupCommand): Promise<JumpGroupModifiedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpGroup.path,
            command.id.toString(),
        );

        return await this.httpClientService.patch<JumpGroupModifiedDtoOutput, JumpGroupModifiedDtoOutput>(
            JumpGroupModifiedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            ModifyJumpGroupDtoInput.create(command.name, command.codeName, command.comments),
        );
    }
}
