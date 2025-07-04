import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { AddMemberToGroupPolicyDtoInput } from '../../dtos/inputs';
import { MemberAddedToGroupPolicyDtoOutput } from '../../dtos/outputs';
import { AddMemberToGroupPolicyCommand } from '../add-member-to-group-policy.command';

@CommandHandler(AddMemberToGroupPolicyCommand)
export class AddMemberToGroupPolicyCommandHandler implements ICommandHandler<AddMemberToGroupPolicyCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: AddMemberToGroupPolicyCommand): Promise<MemberAddedToGroupPolicyDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.groupPolicy.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.groupPolicy.member.path,
        );

        return await this.httpClientService.post<MemberAddedToGroupPolicyDtoOutput, MemberAddedToGroupPolicyDtoOutput>(
            MemberAddedToGroupPolicyDtoOutput,
            url,
            AddMemberToGroupPolicyDtoInput.create(
                command.userId,
                command.securityProviderId,
                command.distinguishedName,
                command.groupName,
            ),
        );
    }
}
