import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RemoveMemberFromGroupPolicyCommand } from '../remove-member-from-group-policy.command';

@CommandHandler(RemoveMemberFromGroupPolicyCommand)
export class RemoveMemberFromGroupPolicyCommandHandler implements ICommandHandler<RemoveMemberFromGroupPolicyCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: RemoveMemberFromGroupPolicyCommand): Promise<void> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.groupPolicy.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.config.groupPolicy.member.path,
            command.memberId.toString(),
        );

        return await this.httpClientService.delete(command.transactionId, command.beyondtrustInstanceId, urlPath);
    }
}
