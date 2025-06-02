import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { ModifyUserGroupPoliciesCommand } from '../../commands/modify-user-group-policies.command';
import { ModifyUserGroupPoliciesDtoInput } from '../../dtos/inputs';
import { UserGroupPoliciesModifiedDtoOutput } from '../../dtos/outputs';

@CommandHandler(ModifyUserGroupPoliciesCommand)
export class ModifyUserGroupPoliciesHandler implements ICommandHandler<ModifyUserGroupPoliciesCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ModifyUserGroupPoliciesCommand): Promise<UserGroupPoliciesModifiedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.user.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.user.groupPolicies.change,
        );

        return await this.httpClientService.patch<
            UserGroupPoliciesModifiedDtoOutput,
            UserGroupPoliciesModifiedDtoOutput
        >(
            UserGroupPoliciesModifiedDtoOutput,
            url,
            ModifyUserGroupPoliciesDtoInput.create(command.groupPolicyIdsToAdd, command.groupPolicyIdsToRemove),
        );
    }
}
