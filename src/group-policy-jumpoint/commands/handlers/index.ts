import { AddJumpointToGroupPolicyCommandHandler } from './add-jumpoint-to-group-policy.command-handler';
import { MarkGroupPolicyJumpointAsSyncedCommandHandler } from './mark-group-policy-jumpoint-as-synced.command-handler';
import { RemoveJumpointFromGroupPolicyCommandHandler } from './remove-jumpoint-from-group-policy.command-handler';

export const CommandHandlers = [
    AddJumpointToGroupPolicyCommandHandler,
    RemoveJumpointFromGroupPolicyCommandHandler,
    MarkGroupPolicyJumpointAsSyncedCommandHandler,
];
