import { ModifyUserGroupPoliciesCommandHandler } from './modify-user-group-policies.command-handler';
import { SyncUserGroupPoliciesAfterUsersSyncedCommandHandler } from './sync-user-group-policies-after-users-synced.command-handler';

export const CommandHandlers = [
    ModifyUserGroupPoliciesCommandHandler,
    SyncUserGroupPoliciesAfterUsersSyncedCommandHandler,
];
