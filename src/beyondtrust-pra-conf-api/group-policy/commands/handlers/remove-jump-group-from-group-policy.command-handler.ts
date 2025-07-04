import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RemoveJumpGroupFromGroupPolicyCommand } from '../remove-jump-group-from-group-policy.command';

@CommandHandler(RemoveJumpGroupFromGroupPolicyCommand)
export class RemoveJumpGroupFromGroupPolicyCommandHandler
    implements ICommandHandler<RemoveJumpGroupFromGroupPolicyCommand>
{
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: RemoveJumpGroupFromGroupPolicyCommand): Promise<void> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.groupPolicy.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.groupPolicy.jumpGroup.path,
            command.jumpGroupId.toString(),
        );

        return await this.httpClientService.delete(url);
    }
}
