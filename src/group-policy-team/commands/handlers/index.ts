import { AddTeamToGroupPolicyCommandHandler } from './add-team-to-group-policy.command-handler';
import { MarkGroupPolicyTeamAsSyncedCommandHandler } from './mark-group-policy-team-as-synced.command-handler';
import { RemoveTeamFromGroupPolicyCommandHandler } from './remove-team-from-group-policy.command-handler';

export const CommandHandlers = [
    AddTeamToGroupPolicyCommandHandler,
    RemoveTeamFromGroupPolicyCommandHandler,
    MarkGroupPolicyTeamAsSyncedCommandHandler,
];
