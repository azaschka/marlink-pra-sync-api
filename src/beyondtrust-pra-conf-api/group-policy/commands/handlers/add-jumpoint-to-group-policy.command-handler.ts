import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { AddJumpointToGroupPolicyDtoInput } from '../../dtos/inputs';
import { JumpointAddedToGroupPolicyDtoOutput } from '../../dtos/outputs';
import { AddJumpointToGroupPolicyCommand } from '../add-jumpoint-to-group-policy.command';

@CommandHandler(AddJumpointToGroupPolicyCommand)
export class AddJumpointToGroupPolicyCommandHandler implements ICommandHandler<AddJumpointToGroupPolicyCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: AddJumpointToGroupPolicyCommand): Promise<JumpointAddedToGroupPolicyDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.groupPolicy.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.groupPolicy.jumpoint.path,
        );

        return await this.httpClientService.post<
            JumpointAddedToGroupPolicyDtoOutput,
            JumpointAddedToGroupPolicyDtoOutput
        >(JumpointAddedToGroupPolicyDtoOutput, url, AddJumpointToGroupPolicyDtoInput.create(command.jumpointId));
    }
}
