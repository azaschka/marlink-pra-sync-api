import { CreateTeamCommandHandler } from './create-team.command-handler';
import { DeleteTeamCommandHandler } from './delete-team.command-handler';
import { ModifyTeamCommandHandler } from './modify-team.command-handler';
import { SyncTeamsCommandHandler } from './sync-teams.command-handler';

export const CommandHandlers = [
    CreateTeamCommandHandler,
    ModifyTeamCommandHandler,
    DeleteTeamCommandHandler,
    SyncTeamsCommandHandler,
];
