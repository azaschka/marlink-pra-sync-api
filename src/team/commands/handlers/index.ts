import { CreateTeamCommandHandler } from './create-team.command-handler';
import { DeleteTeamCommandHandler } from './delete-team.command-handler';
import { UpdateTeamCommandHandler } from './update-team.command-handler';

export const CommandHandlers = [CreateTeamCommandHandler, UpdateTeamCommandHandler, DeleteTeamCommandHandler];
