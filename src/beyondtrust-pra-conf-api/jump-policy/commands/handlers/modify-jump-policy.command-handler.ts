import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { ModifyJumpPolicyDtoInput } from '../../dtos/inputs';
import { JumpPolicyModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyJumpPolicyCommand } from '../modify-jump-policy.command';

@CommandHandler(ModifyJumpPolicyCommand)
export class ModifyJumpPolicyCommandHandler implements ICommandHandler<ModifyJumpPolicyCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ModifyJumpPolicyCommand): Promise<JumpPolicyModifiedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpPolicy.path,
            command.id.toString(),
        );

        return await this.httpClientService.patch<JumpPolicyModifiedDtoOutput, JumpPolicyModifiedDtoOutput>(
            JumpPolicyModifiedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            ModifyJumpPolicyDtoInput.create(
                command.displayName,
                command.codeName,
                command.description,
                command.scheduleEnabled,
                command.simultaneousJumps,
                command.simultaneousJumpBehaviorAppliesToCopies,
                command.simultaneousJumpsRdp,
                command.scheduleStrict,
                command.ticketIdRequired,
                command.twoFactorChallengeRequired,
                command.sessionStartNotification,
                command.sessionEndNotification,
                command.notificationEmailAddresses,
                command.notificationDisplayName,
                command.notificationEmailLanguage,
                command.approvalRequired,
                command.approvalMaxDuration,
                command.approvalScope,
                command.approvalEmailAddresses,
                command.approvalUserIds,
                command.approvalTeamIds,
                command.approvalDisplayName,
                command.approvalEmailLanguage,
                command.approvalApproverScope,
                command.recordingsDisabled,
            ),
        );
    }
}
