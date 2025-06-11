import { TeamMembership } from './team-membership.model';

export interface TeamUser {
    teamId: number;
    membership: TeamMembership;
}
