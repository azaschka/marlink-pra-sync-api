import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { AddUserToTeamDtoInput } from '../../dtos/inputs';
import { UserAddedToTeamDtoOutput } from '../../dtos/outputs';
import { AddUserToTeamCommand } from '../add-user-to-team.command';

@CommandHandler(AddUserToTeamCommand)
export class AddUserToTeamCommandHandler implements ICommandHandler<AddUserToTeamCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: AddUserToTeamCommand): Promise<UserAddedToTeamDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.team.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.config.team.user.path,
        );

        return await this.httpClientService.post<UserAddedToTeamDtoOutput, UserAddedToTeamDtoOutput>(
            UserAddedToTeamDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            AddUserToTeamDtoInput.create(command.userId, command.role),
        );
    }
}
