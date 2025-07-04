import { AddJumpGroupToGroupPolicyCommandHandler } from './add-jump-group-to-group-policy.command-handler';
import { AddJumpointToGroupPolicyCommandHandler } from './add-jumpoint-to-group-policy.command-handler';
import { AddMemberToGroupPolicyCommandHandler } from './add-member-to-group-policy.command-handler';
import { AddTeamToGroupPolicyCommandHandler } from './add-team-to-group-policy.command-handler';
import { CreateGroupPolicyCommandHandler } from './create-group-policy.command-handler';
import { DeleteGroupPolicyCommandHandler } from './delete-group-policy.command-handler';
import { ModifyGroupPolicyCommandHandler } from './modify-group-policy.command-handler';
import { RemoveJumpGroupFromGroupPolicyCommandHandler } from './remove-jump-group-from-group-policy.command-handler';
import { RemoveJumpointFromGroupPolicyCommandHandler } from './remove-jumpoint-from-group-policy.command-handler';
import { RemoveMemberFromGroupPolicyCommandHandler } from './remove-member-from-group-policy.command-handler';
import { RemoveTeamFromGroupPolicyCommandHandler } from './remove-team-from-group-policy.command-handler';

export const CommandHandlers = [
    CreateGroupPolicyCommandHandler,
    ModifyGroupPolicyCommandHandler,
    DeleteGroupPolicyCommandHandler,
    AddJumpointToGroupPolicyCommandHandler,
    AddJumpGroupToGroupPolicyCommandHandler,
    AddMemberToGroupPolicyCommandHandler,
    AddTeamToGroupPolicyCommandHandler,
    RemoveJumpointFromGroupPolicyCommandHandler,
    RemoveJumpGroupFromGroupPolicyCommandHandler,
    RemoveTeamFromGroupPolicyCommandHandler,
    RemoveMemberFromGroupPolicyCommandHandler,
];
