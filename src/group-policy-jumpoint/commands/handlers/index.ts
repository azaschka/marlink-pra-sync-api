import { AddJumpointToGroupPolicyCommandHandler } from './add-jumpoint-to-group-policy.command-handler';
import { RemoveJumpointFromGroupPolicyCommandHandler } from './remove-jumpoint-from-group-policy.command-handler';
import { SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-jumpoints-after-jumpoints-synced.command-handler';

export const CommandHandlers = [
    AddJumpointToGroupPolicyCommandHandler,
    RemoveJumpointFromGroupPolicyCommandHandler,
    SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommandHandler,
];
