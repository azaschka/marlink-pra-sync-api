import { AddUserToTeamCommandHandler } from './add-user-to-team.command-handler';
import { RemoveUserFromTeamCommandHandler } from './remove-user-from-team.command-handler';
import { SyncTeamUsersAfterTeamsSyncedCommandHandler } from './sync-team-users-after-users-synced.command-handler';

export const CommandHandlers = [
    AddUserToTeamCommandHandler,
    RemoveUserFromTeamCommandHandler,
    SyncTeamUsersAfterTeamsSyncedCommandHandler,
];
