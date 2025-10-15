import { SyncComparatorCommandHandler } from './sync-comparator.command-handler';
import { SyncGroupPoliciesCommandHandler } from './sync-group-policies.command-handler';
import { SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-jump-groups-after-group-policies-synced.command-handler';
import { SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-jumpoints-after-group-policies-synced.command-handler';
import { SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-members-after-group-policies-synced.command-handler';
import { SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-teams-after-group-policies-synced.command-handler';
import { SyncJumpClientInstallersCommandHandler } from './sync-jump-client-installers.command-handler';
import { SyncJumpClientsCommandHandler } from './sync-jump-clients.command-handler';
import { SyncJumpGroupsCommandHandler } from './sync-jump-groups.command-handler';
import { SyncJumpPoliciesCommandHandler } from './sync-jump-policies.command-handler';
import { SyncJumpointNodesAfterJumpointsSyncedCommandHandler } from './sync-jumpoint-nodes-after-jumpoints-synced.command-handler';
import { SyncJumpointsCommandHandler } from './sync-jumpoints.command-handler';
import { SyncProtocolTunnelJumpsCommandHandler } from './sync-protocol-tunnel-jumps.command-handler';
import { SyncRemoteRdpsCommandHandler } from './sync-remote-rdps.command-handler';
import { SyncRemoteVncsCommandHandler } from './sync-remote-vncs.command-handler';
import { SyncShellJumpsCommandHandler } from './sync-shell-jumps.command-handler';
import { SyncTeamUsersAfterTeamsSyncedCommandHandler } from './sync-team-users-after-teams-synced.command-handler';
import { SyncTeamsCommandHandler } from './sync-teams.command-handler';
import { SyncUserGroupPoliciesAfterUsersSyncedCommandHandler } from './sync-user-group-policies-after-users-synced.command-handler';
import { SyncUsersCommandHandler } from './sync-users.command-handler';
import { SyncWebJumpsCommandHandler } from './sync-web-jumps.command-handler';

export const CommandHandlers = [
    SyncGroupPoliciesCommandHandler,
    SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommandHandler,
    SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommandHandler,
    SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommandHandler,
    SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommandHandler,
    SyncJumpClientInstallersCommandHandler,
    SyncJumpClientsCommandHandler,
    SyncJumpGroupsCommandHandler,
    SyncJumpPoliciesCommandHandler,
    SyncJumpointNodesAfterJumpointsSyncedCommandHandler,
    SyncJumpointsCommandHandler,
    SyncProtocolTunnelJumpsCommandHandler,
    SyncRemoteRdpsCommandHandler,
    SyncRemoteVncsCommandHandler,
    SyncShellJumpsCommandHandler,
    SyncTeamUsersAfterTeamsSyncedCommandHandler,
    SyncTeamsCommandHandler,
    SyncUserGroupPoliciesAfterUsersSyncedCommandHandler,
    SyncUsersCommandHandler,
    SyncWebJumpsCommandHandler,
    SyncComparatorCommandHandler,
];
