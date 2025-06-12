import { RetrieveAllTeamUsersQueryHandler } from './retrieve-all-team-users.query-handler';
import { RetrieveTeamUsersQueryHandler } from './retrieve-team-users.query-handler';
import { RetrieveTeamsQueryHandler } from './retrieve-teams.query-handler';

export const QueryHandlers = [
    RetrieveTeamsQueryHandler,
    RetrieveTeamUsersQueryHandler,
    RetrieveAllTeamUsersQueryHandler,
];
