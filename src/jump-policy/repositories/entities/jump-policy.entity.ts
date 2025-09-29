import { JumpClientEntity } from '../../../jump-client/repositories/entities';
import { ProtocolTunnelJumpEntity } from '../../../jump-item/protocol-tunnel-jump/repositories/entities';
import { RemoteRdpEntity } from '../../../jump-item/remote-rdp/repositories/entities';
import { RemoteVncEntity } from '../../../jump-item/remote-vnc/repositories/entities';
import { ShellJumpEntity } from '../../../jump-item/shell-jump/repositories/entities';
import { WebJumpEntity } from '../../../jump-item/web-jump/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import {
    ApprovalApproverScopeType,
    ApprovalScopeType,
    SimultaneousJumpsRdpType,
    SimultaneousJumpsType,
} from '../../enums';
import { JumpPolicy } from '../../models';

export class JumpPolicyEntity implements JumpPolicy {
    public id!: number;
    public displayName!: string;
    public codeName?: string;
    public description?: string;
    public hasScheduledAccessRestriction?: boolean;
    public simultaneousJumpsType?: SimultaneousJumpsType;
    public doesSimultaneousJumpBehaviorApplyToCopies?: boolean;
    public simultaneousJumpsRdpType?: SimultaneousJumpsRdpType;
    public shouldForceRemoveUsersWhenScheduleDisallows?: boolean;
    public isTicketIdRequired?: boolean;
    public isTwoFactorChallengeRequired?: boolean;
    public isSessionStartNotificationEnabled?: boolean;
    public isSessionEndNotificationEnabled?: boolean;
    public notificationEmailAddresses?: string[];
    public notificationDisplayName?: string;
    public notificationEmailLanguage?: string;
    public isApprovalRequired?: boolean;
    public approvalMaxDurationInMinutes?: number;
    public approvalScopeType?: ApprovalScopeType;
    public approvalEmailAddresses?: string[];
    public approvalUserIds?: string[];
    public approvalTeamIds?: string[];
    public approvalDisplayName?: string;
    public approvalEmailLanguage?: string;
    public approvalApproverScopeType?: ApprovalApproverScopeType;
    public isRecordingsDisabled?: boolean;
    public lastSyncDate!: Date;
    public protocolTunnelJumps?: ProtocolTunnelJumpEntity[];
    public remoteRdps?: RemoteRdpEntity[];
    public remoteVncs?: RemoteVncEntity[];
    public shellJumps?: ShellJumpEntity[];
    public webJumps?: WebJumpEntity[];
    public jumpClients?: JumpClientEntity[];

    public static create(
        id: number,
        displayName: string,
        codeName?: string,
        description?: string,
        hasScheduledAccessRestriction?: boolean,
        simultaneousJumpsType?: SimultaneousJumpsType,
        doesSimultaneousJumpBehaviorApplyToCopies?: boolean,
        simultaneousJumpsRdpType?: SimultaneousJumpsRdpType,
        shouldForceRemoveUsersWhenScheduleDisallows?: boolean,
        isTicketIdRequired?: boolean,
        isTwoFactorChallengeRequired?: boolean,
        isSessionStartNotificationEnabled?: boolean,
        isSessionEndNotificationEnabled?: boolean,
        notificationEmailAddresses?: string[],
        notificationDisplayName?: string,
        notificationEmailLanguage?: string,
        isApprovalRequired?: boolean,
        approvalMaxDurationInMinutes?: number,
        approvalScopeType?: ApprovalScopeType,
        approvalEmailAddresses?: string[],
        approvalUserIds?: string[],
        approvalTeamIds?: string[],
        approvalDisplayName?: string,
        approvalEmailLanguage?: string,
        approvalApproverScopeType?: ApprovalApproverScopeType,
        isRecordingsDisabled?: boolean,
    ): JumpPolicyEntity {
        const entity = new JumpPolicyEntity();
        entity.id = id;
        entity.displayName = displayName;
        entity.codeName = codeName;
        entity.description = description;
        entity.hasScheduledAccessRestriction = hasScheduledAccessRestriction;
        entity.simultaneousJumpsType = simultaneousJumpsType;
        entity.doesSimultaneousJumpBehaviorApplyToCopies = doesSimultaneousJumpBehaviorApplyToCopies;
        entity.simultaneousJumpsRdpType = simultaneousJumpsRdpType;
        entity.shouldForceRemoveUsersWhenScheduleDisallows = shouldForceRemoveUsersWhenScheduleDisallows;
        entity.isTicketIdRequired = isTicketIdRequired;
        entity.isTwoFactorChallengeRequired = isTwoFactorChallengeRequired;
        entity.isSessionStartNotificationEnabled = isSessionStartNotificationEnabled;
        entity.isSessionEndNotificationEnabled = isSessionEndNotificationEnabled;
        entity.notificationEmailAddresses = notificationEmailAddresses;
        entity.notificationDisplayName = notificationDisplayName;
        entity.notificationEmailLanguage = notificationEmailLanguage;
        entity.isApprovalRequired = isApprovalRequired;
        entity.approvalMaxDurationInMinutes = approvalMaxDurationInMinutes;
        entity.approvalScopeType = approvalScopeType;
        entity.approvalEmailAddresses = approvalEmailAddresses;
        entity.approvalUserIds = approvalUserIds;
        entity.approvalTeamIds = approvalTeamIds;
        entity.approvalDisplayName = approvalDisplayName;
        entity.approvalEmailLanguage = approvalEmailLanguage;
        entity.approvalApproverScopeType = approvalApproverScopeType;
        entity.isRecordingsDisabled = isRecordingsDisabled;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
