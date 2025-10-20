import { ScanDiscrepancyCommandHandler } from './scan-discrepancy.command-handler';
import { SyncDiscrepancyCommandHandler } from './sync-discrepancy.command-handler';
import { SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-jump-groups-after-group-policies-synced.command-handler';
import { SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-jumpoints-after-group-policies-synced.command-handler';
import { SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-members-after-group-policies-synced.command-handler';
import { SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-teams-after-group-policies-synced.command-handler';
import { SyncJumpointNodesAfterJumpointsSyncedCommandHandler } from './sync-jumpoint-nodes-after-jumpoints-synced.command-handler';
import { SyncTeamUsersAfterTeamsSyncedCommandHandler } from './sync-team-users-after-teams-synced.command-handler';
import { SyncUserGroupPoliciesAfterUsersSyncedCommandHandler } from './sync-user-group-policies-after-users-synced.command-handler';

export const CommandHandlers = [
    SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommandHandler,
    SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommandHandler,
    SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommandHandler,
    SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommandHandler,
    SyncJumpointNodesAfterJumpointsSyncedCommandHandler,
    SyncTeamUsersAfterTeamsSyncedCommandHandler,
    SyncUserGroupPoliciesAfterUsersSyncedCommandHandler,
    ScanDiscrepancyCommandHandler,
    SyncDiscrepancyCommandHandler,
];
