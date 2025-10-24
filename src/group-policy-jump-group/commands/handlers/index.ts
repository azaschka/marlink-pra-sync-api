import { AddJumpGroupToGroupPolicyCommandHandler } from './add-jump-group-to-group-policy.command-handler';
import { MarkGroupPolicyJumpGroupAsSyncedCommandHandler } from './mark-group-policy-jump-group-as-synced.command-handler';
import { RemoveJumpGroupFromGroupPolicyCommandHandler } from './remove-jump-group-from-group-policy.command-handler';

export const CommandHandlers = [
    AddJumpGroupToGroupPolicyCommandHandler,
    RemoveJumpGroupFromGroupPolicyCommandHandler,
    MarkGroupPolicyJumpGroupAsSyncedCommandHandler,
];
