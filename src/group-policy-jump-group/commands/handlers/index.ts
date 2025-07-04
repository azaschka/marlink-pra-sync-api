import { AddJumpGroupToGroupPolicyCommandHandler } from './add-jump-group-to-group-policy.command-handler';
import { RemoveJumpGroupFromGroupPolicyCommandHandler } from './remove-jump-group-from-group-policy.command-handler';
import { SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-jump-groups-after-jump-groups-synced.command-handler';

export const CommandHandlers = [
    AddJumpGroupToGroupPolicyCommandHandler,
    RemoveJumpGroupFromGroupPolicyCommandHandler,
    SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommandHandler,
];
