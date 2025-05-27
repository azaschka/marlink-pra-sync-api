import { ApiProperty } from '@nestjs/swagger';
import {
    UserAllowedAccessPermissionType,
    UserViewSupportReportsPermissionType,
    UserViewVaultReportsPermissionType,
} from '../../enums';
import { User } from '../../models';

export class UserModifiedDtoOutput implements User {
    @ApiProperty({ required: true, type: Number })
    public id!: number;

    @ApiProperty({ required: true, type: String })
    public publicDisplayName!: string;

    @ApiProperty({ required: false, type: Number })
    public securityProviderId?: number;

    @ApiProperty({ required: false, type: String })
    public username?: string;

    @ApiProperty({ required: false, type: Date, nullable: true })
    public passwordExpirationDate?: Date | null;

    @ApiProperty({ required: false, type: String })
    public email?: string;

    @ApiProperty({ required: false, type: String })
    public preferredEmailLanguage?: string;

    @ApiProperty({ required: false, type: Boolean })
    public isTwoFactorAuthRequired?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public isLoginAllowed?: boolean;

    @ApiProperty({ required: false, type: Date })
    public lastAuthenticationDate?: Date;

    @ApiProperty({ required: false, type: Number })
    public failedLoginAttempts?: number;

    @ApiProperty({ required: false, type: Boolean })
    public mustResetPasswordOnNextLogin?: boolean;

    @ApiProperty({ required: false, type: Date })
    public creationDate?: Date;

    @ApiProperty({ required: false, type: Boolean })
    public hasTwoFactorAuthEnabled?: boolean;

    @ApiProperty({ required: false, type: Number })
    public fido2CredentialCount?: number;

    @ApiProperty({ required: false, type: Date })
    public fido2LastUsedDate?: Date;

    @ApiProperty({ required: false, type: Boolean })
    public hasAdminPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasSetPasswordsPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasAdminPushagentPermission?: boolean;

    @ApiProperty({ required: false, enum: UserViewSupportReportsPermissionType })
    public viewSupportReportsPermissionType?: UserViewSupportReportsPermissionType;

    @ApiProperty({ required: false, enum: UserViewVaultReportsPermissionType })
    public viewVaultReportsPermissionType?: UserViewVaultReportsPermissionType;

    @ApiProperty({ required: false, type: Boolean })
    public hasViewSyslogReportsPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasViewSdRecordingsPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasEditJumpGroupsPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasEditSdTeamsPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasEditCannedScriptsPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasEditCustomRepLinksPermission?: boolean;

    @ApiProperty({ required: false, enum: UserAllowedAccessPermissionType })
    public allowedAccessPermissionType?: UserAllowedAccessPermissionType;

    @ApiProperty({ required: false, type: Boolean })
    public hasShareOtherTeamPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasInviteExternalUserPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasExtendedAvailabilityModeAllowedPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasEditExternalKeyPermission?: boolean;

    @ApiProperty({ required: false, type: Number })
    public hasSessionIdleTimeoutPermission?: number;

    @ApiProperty({ required: false, type: Boolean })
    public hasCollaboratePermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasCollaborateControlPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasJumpClientPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasLocalJumpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasRemoteJumpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasRemoteVncPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasRemoteRdpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasShellJumpPermission?: boolean;

    @ApiProperty({ required: false, type: Number })
    public defaultJumpItemRoleId?: number;

    @ApiProperty({ required: false, type: Number })
    public privateJumpItemRoleId?: number;

    @ApiProperty({ required: false, type: Number })
    public inferiorJumpItemRoleId?: number;

    @ApiProperty({ required: false, type: Number })
    public unassignedJumpItemRoleId?: number;

    @ApiProperty({ required: false, type: Boolean })
    public hasWebJumpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasProtocolTunnelPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasSdStaticPortForExternalToolsPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasVaultPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasEndpointAutomationPermission?: boolean;

    @ApiProperty({ required: true, type: Date })
    public lastSyncDate!: Date;
}
