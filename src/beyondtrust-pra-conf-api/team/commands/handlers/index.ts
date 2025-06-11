import { AddUserToTeamCommandHandler } from './add-user-to-team.command-handler';
import { CreateTeamCommandHandler } from './create-team.command-handler';
import { DeleteTeamCommandHandler } from './delete-team.command-handler';
import { ModifyTeamCommandHandler } from './modify-team.command-handler';
import { RemoveUserFromTeamCommandHandler } from './remove-user-from-team.command-handler';

export const CommandHandlers = [
    CreateTeamCommandHandler,
    ModifyTeamCommandHandler,
    DeleteTeamCommandHandler,
    AddUserToTeamCommandHandler,
    RemoveUserFromTeamCommandHandler,
];
