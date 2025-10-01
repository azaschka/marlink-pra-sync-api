import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { ModifyTeamDtoInput } from '../../dtos/inputs';
import { TeamModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyTeamCommand } from '../modify-team.command';

@CommandHandler(ModifyTeamCommand)
export class ModifyTeamCommandHandler implements ICommandHandler<ModifyTeamCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ModifyTeamCommand): Promise<TeamModifiedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.team.path,
            command.id.toString(),
        );

        return await this.httpClientService.patch<TeamModifiedDtoOutput, TeamModifiedDtoOutput>(
            TeamModifiedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            ModifyTeamDtoInput.create(command.name, command.codeName, command.comments),
        );
    }
}
