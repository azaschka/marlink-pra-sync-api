import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { CreateTeamDtoInput } from '../../dtos/inputs';
import { TeamCreatedDtoOutput } from '../../dtos/outputs';
import { CreateTeamCommand } from '../create-team.command';

@CommandHandler(CreateTeamCommand)
export class CreateTeamCommandHandler implements ICommandHandler<CreateTeamCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateTeamCommand): Promise<TeamCreatedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.path.team,
        );

        return await this.httpClientService.post<TeamCreatedDtoOutput, TeamCreatedDtoOutput>(
            TeamCreatedDtoOutput,
            url,
            CreateTeamDtoInput.create(command.name, command.codeName, command.comments),
        );
    }
}
