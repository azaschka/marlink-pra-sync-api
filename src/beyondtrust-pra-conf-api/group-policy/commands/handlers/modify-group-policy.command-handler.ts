import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { ModifyGroupPolicyDtoInput } from '../../dtos/inputs';
import { GroupPolicyModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyGroupPolicyCommand } from '../modify-group-policy.command';

@CommandHandler(ModifyGroupPolicyCommand)
export class ModifyGroupPolicyCommandHandler implements ICommandHandler<ModifyGroupPolicyCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ModifyGroupPolicyCommand): Promise<GroupPolicyModifiedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.groupPolicy.path,
            command.id.toString(),
        );

        return await this.httpClientService.patch<GroupPolicyModifiedDtoOutput, GroupPolicyModifiedDtoOutput>(
            GroupPolicyModifiedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            ModifyGroupPolicyDtoInput.create(
                command.name,
                command.hasEndpointsAccessPermission,
                command.accessPermissionStatusType,
                command.hasShareOtherTeamPermission,
                command.hasInviteExternalUserPermission,
                command.userSessionIdleTimeoutInSeconds,
                command.hasEnableExtendedAvailabilityModePermission,
                command.hasEditExternalKeyPermission,
                command.hasCollaboratePermission,
                command.hasCollaborateControlPermission,
                command.hasJumpClientPermission,
                command.hasLocalJumpPermission,
                command.hasRemoteJumpPermission,
                command.hasRemoteVncPermission,
                command.hasRemoteRdpPermission,
                command.hasShellJumpPermission,
                command.hasWebJumpPermission,
                command.hasProtocolTunnelPermission,
                command.hasSdStaticPortForExternalToolsPermission,
                command.defaultJumpItemRoleId,
                command.privateJumpItemRoleId,
                command.inferiorJumpItemRoleId,
                command.unassignedJumpItemRoleId,
            ),
        );
    }
}
