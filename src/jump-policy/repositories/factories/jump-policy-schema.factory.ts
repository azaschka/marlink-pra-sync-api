import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import {
    ApprovalApproverScopeType,
    ApprovalScopeType,
    SimultaneousJumpsRdpType,
    SimultaneousJumpsType,
} from '../../enums';
import { JumpPolicy } from '../../models';

export class JumpPolicySchemaFactory implements BaseTenantEntitySchemaFactory<JumpPolicy> {
    public static readonly TABLE_NAME = 'jump_policies';

    public create(tenantId: number): EntitySchema<JumpPolicy> {
        return new EntitySchema<JumpPolicy>({
            name: `${JumpPolicySchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${JumpPolicySchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                id: {
                    name: 'id',
                    type: 'int',
                    primary: true,
                    generated: undefined,
                    unique: true,
                },
                displayName: {
                    name: 'display_name',
                    type: 'varchar',
                    nullable: false,
                },
                codeName: {
                    name: 'code_name',
                    type: 'varchar',
                    nullable: true,
                },
                description: {
                    name: 'description',
                    type: 'text',
                    nullable: true,
                },
                hasScheduledAccessRestriction: {
                    name: 'has_scheduled_access_restriction',
                    type: 'boolean',
                    nullable: true,
                },
                simultaneousJumpsType: {
                    name: 'simultaneous_jumps_type',
                    type: 'enum',
                    enum: SimultaneousJumpsType,
                    nullable: true,
                },
                doesSimultaneousJumpBehaviorApplyToCopies: {
                    name: 'does_simultaneous_jump_behavior_apply_to_copies',
                    type: 'boolean',
                    nullable: true,
                },
                simultaneousJumpsRdpType: {
                    name: 'simultaneous_jumps_rdp_type',
                    type: 'enum',
                    enum: SimultaneousJumpsRdpType,
                    nullable: true,
                },
                shouldForceRemoveUsersWhenScheduleDisallows: {
                    name: 'should_force_remove_users_when_schedule_disallows',
                    type: 'boolean',
                    nullable: true,
                },
                isTicketIdRequired: {
                    name: 'is_ticket_id_required',
                    type: 'boolean',
                    nullable: true,
                },
                isTwoFactorChallengeRequired: {
                    name: 'is_two_factor_challenge_required',
                    type: 'boolean',
                    nullable: true,
                },
                isSessionStartNotificationEnabled: {
                    name: 'is_session_start_notification_enabled',
                    type: 'boolean',
                    nullable: true,
                },
                isSessionEndNotificationEnabled: {
                    name: 'is_session_end_notification_enabled',
                    type: 'boolean',
                    nullable: true,
                },
                notificationEmailAddresses: {
                    name: 'notification_email_addresses',
                    type: 'simple-array',
                    nullable: true,
                },
                notificationDisplayName: {
                    name: 'notification_display_name',
                    type: 'varchar',
                    nullable: true,
                },
                notificationEmailLanguage: {
                    name: 'notification_email_language',
                    type: 'varchar',
                    nullable: true,
                },
                isApprovalRequired: {
                    name: 'is_approval_required',
                    type: 'boolean',
                    nullable: true,
                },
                approvalMaxDurationInMinutes: {
                    name: 'approval_max_duration_in_minutes',
                    type: 'int',
                    nullable: true,
                },
                approvalScopeType: {
                    name: 'approval_scope_type',
                    type: 'enum',
                    enum: ApprovalScopeType,
                    nullable: true,
                },
                approvalEmailAddresses: {
                    name: 'approval_email_addresses',
                    type: 'simple-array',
                    nullable: true,
                },
                approvalUserIds: {
                    name: 'approval_user_ids',
                    type: 'simple-array',
                    nullable: true,
                },
                approvalTeamIds: {
                    name: 'approval_team_ids',
                    type: 'simple-array',
                    nullable: true,
                },
                approvalDisplayName: {
                    name: 'approval_display_name',
                    type: 'varchar',
                    nullable: true,
                },
                approvalEmailLanguage: {
                    name: 'approval_email_language',
                    type: 'varchar',
                    nullable: true,
                },
                approvalApproverScopeType: {
                    name: 'approval_approver_scope_type',
                    type: 'enum',
                    enum: ApprovalApproverScopeType,
                    nullable: true,
                },
                isRecordingsDisabled: {
                    name: 'is_recordings_disabled',
                    type: 'boolean',
                    nullable: true,
                },
                lastSyncDate: {
                    name: 'last_sync_date',
                    type: 'timestamp',
                    precision: 3,
                    nullable: false,
                    updateDate: true,
                },
            },
            relations: {
                protocolTunnelJumps: {
                    type: 'one-to-many',
                    target: `jump_item_protocol_tunnel_jumps_${tenantId}`,
                    inverseSide: 'jumpPolicy',
                },
                remoteRdps: {
                    type: 'one-to-many',
                    target: `jump_item_remote_rdps_${tenantId}`,
                    inverseSide: 'jumpPolicy',
                },
                remoteVncs: {
                    type: 'one-to-many',
                    target: `jump_item_remote_vncs_${tenantId}`,
                    inverseSide: 'jumpPolicy',
                },
                shellJumps: {
                    type: 'one-to-many',
                    target: `jump_item_shell_jumps_${tenantId}`,
                    inverseSide: 'jumpPolicy',
                },
                webJumps: {
                    type: 'one-to-many',
                    target: `jump_item_web_jumps_${tenantId}`,
                    inverseSide: 'jumpPolicy',
                },
                jumpClients: {
                    type: 'one-to-many',
                    target: `jump_clients_${tenantId}`,
                    inverseSide: 'jumpPolicy',
                },
            },
        });
    }
}
