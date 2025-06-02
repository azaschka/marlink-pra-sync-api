import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { CreateGroupPolicyDtoInput } from '../../dtos/inputs';
import { GroupPolicyCreatedDtoOutput } from '../../dtos/outputs';
import { CreateGroupPolicyCommand } from '../create-group-policy.command';

@CommandHandler(CreateGroupPolicyCommand)
export class CreateGroupPolicyCommandHandler implements ICommandHandler<CreateGroupPolicyCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateGroupPolicyCommand): Promise<GroupPolicyCreatedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.groupPolicy.path,
        );

        return await this.httpClientService.post<GroupPolicyCreatedDtoOutput, GroupPolicyCreatedDtoOutput>(
            GroupPolicyCreatedDtoOutput,
            url,
            CreateGroupPolicyDtoInput.create(
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
