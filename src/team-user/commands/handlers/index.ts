import { AddUserToTeamCommandHandler } from './add-user-to-team.command-handler';
import { MarkTeamUserAsSyncedCommandHandler } from './mark-team-user-as-synced.command-handler';
import { RemoveUserFromTeamCommandHandler } from './remove-user-from-team.command-handler';

export const CommandHandlers = [
    AddUserToTeamCommandHandler,
    RemoveUserFromTeamCommandHandler,
    MarkTeamUserAsSyncedCommandHandler,
];
