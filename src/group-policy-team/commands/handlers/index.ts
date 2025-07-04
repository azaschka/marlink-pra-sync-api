import { AddTeamToGroupPolicyCommandHandler } from './add-team-to-group-policy.command-handler';
import { RemoveTeamFromGroupPolicyCommandHandler } from './remove-team-from-group-policy.command-handler';
import { SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-teams-after-teams-synced.command-handler';

export const CommandHandlers = [
    AddTeamToGroupPolicyCommandHandler,
    RemoveTeamFromGroupPolicyCommandHandler,
    SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommandHandler,
];
