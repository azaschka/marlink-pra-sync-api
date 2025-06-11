import { TeamMembership } from './team-membership.model';

export interface TeamUsers {
    teamId: number;
    memberships: TeamMembership[];
}
