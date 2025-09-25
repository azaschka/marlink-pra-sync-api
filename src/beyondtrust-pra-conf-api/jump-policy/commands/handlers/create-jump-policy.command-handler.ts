import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { CreateJumpPolicyDtoInput } from '../../dtos/inputs';
import { JumpPolicyCreatedDtoOutput } from '../../dtos/outputs';
import { CreateJumpPolicyCommand } from '../create-jump-policy.command';

@CommandHandler(CreateJumpPolicyCommand)
export class CreateJumpPolicyCommandHandler implements ICommandHandler<CreateJumpPolicyCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateJumpPolicyCommand): Promise<JumpPolicyCreatedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpPolicy.path,
        );

        return await this.httpClientService.post<JumpPolicyCreatedDtoOutput, JumpPolicyCreatedDtoOutput>(
            JumpPolicyCreatedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            CreateJumpPolicyDtoInput.create(
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
