import { AddJumpointToGroupPolicyCommandHandler } from './add-jumpoint-to-group-policy.command-handler';
import { CreateGroupPolicyCommandHandler } from './create-group-policy.command-handler';
import { DeleteGroupPolicyCommandHandler } from './delete-group-policy.command-handler';
import { ModifyGroupPolicyCommandHandler } from './modify-group-policy.command-handler';
import { RemoveJumpointFromGroupPolicyCommandHandler } from './remove-jumpoint-from-group-policy.command-handler';

export const CommandHandlers = [
    CreateGroupPolicyCommandHandler,
    ModifyGroupPolicyCommandHandler,
    DeleteGroupPolicyCommandHandler,
    AddJumpointToGroupPolicyCommandHandler,
    RemoveJumpointFromGroupPolicyCommandHandler,
];
