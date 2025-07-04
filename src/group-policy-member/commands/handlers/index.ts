import { AddMemberToGroupPolicyCommandHandler } from './add-member-to-group-policy.command-handler';
import { RemoveMemberFromGroupPolicyCommandHandler } from './remove-member-from-group-policy.command-handler';
import { SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-members-after-members-synced.command-handler';

export const CommandHandlers = [
    AddMemberToGroupPolicyCommandHandler,
    RemoveMemberFromGroupPolicyCommandHandler,
    SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommandHandler,
];
