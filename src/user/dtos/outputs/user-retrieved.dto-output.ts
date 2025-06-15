import { ApiProperty } from '@nestjs/swagger';
import {
    UserAllowedAccessPermissionType,
    UserViewSupportReportsPermissionType,
    UserViewVaultReportsPermissionType,
} from '../../enums';
import { User } from '../../models';

export class UserRetrievedDtoOutput implements User {
    @ApiProperty({
        required: true,
        type: Number,
        description: 'The unique identifier assigned to this user by the appliance.',
    })
    public id!: number;

    @ApiProperty({
        required: true,
        type: String,
        description:
            "The user's public display name. This attribute is read-only for users who belong to a security provider that synchronizes display names.",
    })
    public publicDisplayName!: string;

    @ApiProperty({
        required: false,
        type: Number,
        description:
            'The unique identifier of the security provider through which this user authenticates. This attribute is read-only.',
    })
    public securityProviderId?: number;

    @ApiProperty({
        required: false,
        type: String,
        description: 'The username the user last used to log in. This attribute is read-only for non-local users.',
    })
    public username?: string;

    @ApiProperty({
        required: false,
        type: Date,
        nullable: true,
        description:
            "The date and time at which the local user's password will expire as an RFC3339 date-time string. This attribute is only returned for local users and can only be updated on local users. If not set or set to a null or empty value, then the local user's password never expires.",
    })
    public passwordExpirationDate?: Date | null;

    @ApiProperty({
        required: false,
        type: String,
        description:
            "The user's email address. This attribute is read-only for users who belong to a security provider that synchronizes email addresses.",
    })
    public email?: string;

    @ApiProperty({
        required: false,
        type: String,
        default: 'en-us',
        description: 'Must be the locale code for one of the locales listed.',
    })
    public preferredEmailLanguage?: string = 'en-us';

    @ApiProperty({
        required: false,
        type: Boolean,
        description:
            'If true, this user must use two factor authentication via a TOTP application. If false, this user may opt-in to using two-factor authentication via a TOTP application. There is no way to prevent a user from opting in to two-factor authentication. This attribute is only available for local and LDAP users.',
        default: false,
    })
    public isTwoFactorAuthRequired?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'If true, this user is allowed to log in.',
        default: true,
    })
    public isLoginAllowed?: boolean = true;

    @ApiProperty({
        required: false,
        type: Date,
        description: 'The last date/time at which the user authenticated. This attribute is read-only.',
    })
    public lastAuthenticationDate?: Date;

    @ApiProperty({
        required: false,
        type: Number,
        description:
            'The number of times this local user has failed to authenticate. This attribute is only returned for local users and can only be updated on local users. It is always 0 for new local users, so it is ignored in POST requests. You may set it to 0 in PATCH requests to unlock an account that has too many failed logins.',
        default: 0,
    })
    public failedLoginAttempts?: number = 0;

    @ApiProperty({
        required: false,
        type: Boolean,
        description:
            "If true, this local user's password must be reset on their next login. This attribute is only returned for local users and can only be set on local users.",
        default: false,
    })
    public mustResetPasswordOnNextLogin?: boolean = false;

    @ApiProperty({
        required: false,
        type: Date,
        description:
            'The date/time at which this user resource was created. For non-local users, this time represents the time at which the user resource was added in Privileged Remote Access. It does not represent the time at which the user account was created in an external user store, such as an LDAP server.',
    })
    public creationDate?: Date;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'If true, this user has enabled two factor authentication.',
    })
    public hasTwoFactorAuthEnabled?: boolean;

    @ApiProperty({
        required: false,
        type: Number,
        description: 'The number of FIDO2 credentials registered for this user.',
    })
    public fido2CredentialCount?: number;

    @ApiProperty({
        required: false,
        type: Date,
        description: 'The date and time at which the user last used a FIDO2 credential to authenticate.',
    })
    public fido2LastUsedDate?: Date;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'If true, the user has admin permissions.',
    })
    public hasAdminPermission?: boolean;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'If true, the user has permission to set passwords.',
    })
    public hasSetPasswordsPermission?: boolean;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'If true, the user has permission to edit jumpoints.',
    })
    public hasAdminPushagentPermission?: boolean;

    @ApiProperty({
        required: false,
        enum: UserViewSupportReportsPermissionType,
        description: 'Session Reporting Permissions.',
    })
    public viewSupportReportsPermissionType?: UserViewSupportReportsPermissionType;

    @ApiProperty({
        required: false,
        enum: UserViewVaultReportsPermissionType,
        description: 'The type of vault reports permission for the user.',
    })
    public viewVaultReportsPermissionType?: UserViewVaultReportsPermissionType;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'If true, the user has permission to view syslog reports.',
    })
    public hasViewSyslogReportsPermission?: boolean;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'If true, the user has permission to view session recordings.',
    })
    public hasViewSdRecordingsPermission?: boolean;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'If true, the user has permission to edit jump groups.',
    })
    public hasEditJumpGroupsPermission?: boolean;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'If true, the user has permission to edit teams.',
    })
    public hasEditSdTeamsPermission?: boolean;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'If true, the user has permission to edit canned scripts.',
    })
    public hasEditCannedScriptsPermission?: boolean;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'If true, the user has permission to edit custom links.',
    })
    public hasEditCustomRepLinksPermission?: boolean;

    @ApiProperty({
        required: false,
        enum: UserAllowedAccessPermissionType,
        description: 'Allowed to access endpoints.',
    })
    public allowedAccessPermissionType?: UserAllowedAccessPermissionType;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to share sessions with teams which they do not belong to.',
        default: false,
    })
    public hasShareOtherTeamPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'If true, the user has permission to invite external users.',
        default: false,
    })
    public hasInviteExternalUserPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to enable extended availability mode.',
        default: false,
    })
    public hasExtendedAvailabilityModeAllowedPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'If true, the user has permission to edit external keys.',
        default: false,
    })
    public hasEditExternalKeyPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Number,
        description: `Remove User from the session after they've been inactive for a certain number of seconds. Allowed values are -1, 0, 300, 600, 900, 1800, 3600, 7200, 14400, 28800, 43200, and 86400. -1 means "Use site wide setting". 0 means "No timeout".`,
        default: -1,
    })
    public sessionInactivityTimeoutInSeconds?: number = -1;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to show screen to other Users.',
        default: false,
    })
    public hasCollaboratePermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to give control when showing screen to other Users.',
        default: false,
    })
    public hasCollaborateControlPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to use Jump Clients.',
        default: false,
    })
    public hasJumpClientPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to use Local Jump (Windows only).',
        default: false,
    })
    public hasLocalJumpPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to use Remote Jump.',
        default: false,
    })
    public hasRemoteJumpPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to use Remote VNC.',
        default: false,
    })
    public hasRemoteVncPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to use Remote RDP.',
        default: false,
    })
    public hasRemoteRdpPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to use Shell Jump.',
        default: false,
    })
    public hasShellJumpPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Number,
        description: 'Default Jump Item Role.',
        default: 1,
    })
    public defaultJumpItemRoleId?: number = 1;

    @ApiProperty({
        required: false,
        type: Number,
        description: 'Personal Jump Item Role.',
        default: 1,
    })
    public privateJumpItemRoleId?: number = 1;

    @ApiProperty({
        required: false,
        type: Number,
        description: 'Teams Jump Item Role.',
        default: 1,
    })
    public inferiorJumpItemRoleId?: number = 1;

    @ApiProperty({
        required: false,
        type: Number,
        description: 'System Jump Item Role.',
        default: 1,
    })
    public unassignedJumpItemRoleId?: number = 1;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to use Web Jump.',
        default: false,
    })
    public hasWebJumpPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to use Protocol Tunnel Jump.',
        default: false,
    })
    public hasProtocolTunnelPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to use static port and username for external tool sessions.',
        default: false,
    })
    public hasSdStaticPortForExternalToolsPermission?: boolean = false;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to Administer Vault.',
    })
    public hasVaultPermission?: boolean;

    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Allowed to Administer Endpoint Automation.',
    })
    public hasEndpointAutomationPermission?: boolean;

    @ApiProperty({
        required: true,
        type: Date,
        description: 'The date which the user was last synchronized with BeyondTrust Privileged Remote Access.',
    })
    public lastSyncDate!: Date;
}
