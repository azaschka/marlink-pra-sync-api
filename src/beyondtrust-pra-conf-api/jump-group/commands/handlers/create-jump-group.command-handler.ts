import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { CreateJumpGroupDtoInput } from '../../dtos/inputs';
import { JumpGroupCreatedDtoOutput } from '../../dtos/outputs';
import { CreateJumpGroupCommand } from '../create-jump-group.command';

@CommandHandler(CreateJumpGroupCommand)
export class CreateJumpGroupCommandHandler implements ICommandHandler<CreateJumpGroupCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateJumpGroupCommand): Promise<JumpGroupCreatedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.path.jumpGroup,
        );

        return await this.httpClientService.post<JumpGroupCreatedDtoOutput, JumpGroupCreatedDtoOutput>(
            JumpGroupCreatedDtoOutput,
            url,
            CreateJumpGroupDtoInput.create(command.name, command.codeName, command.comments),
        );
    }
}
