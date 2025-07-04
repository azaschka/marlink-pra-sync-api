import { RetrieveAllGroupPolicyJumpGroupsQueryHandler } from './retrieve-all-group-policy-jump-groups.query-handler';
import { RetrieveAllGroupPolicyJumpointsQueryHandler } from './retrieve-all-group-policy-jumpoints.query-handler';
import { RetrieveAllGroupPolicyMembersQueryHandler } from './retrieve-all-group-policy-members.query-handler';
import { RetrieveAllGroupPolicyTeamsQueryHandler } from './retrieve-all-group-policy-teams.query-handler';
import { RetrieveGroupPoliciesQueryHandler } from './retrieve-group-policies.query-handler';
import { RetrieveGroupPolicyJumpGroupsQueryHandler } from './retrieve-group-policy-jump-groups.query-handler';
import { RetrieveGroupPolicyJumpointsQueryHandler } from './retrieve-group-policy-jumpoints.query-handler';
import { RetrieveGroupPolicyMembersQueryHandler } from './retrieve-group-policy-members.query-handler';
import { RetrieveGroupPolicyTeamsQueryHandler } from './retrieve-group-policy-teams.query-handler';

export const QueryHandlers = [
    RetrieveGroupPoliciesQueryHandler,
    RetrieveAllGroupPolicyJumpointsQueryHandler,
    RetrieveGroupPolicyJumpointsQueryHandler,
    RetrieveAllGroupPolicyJumpGroupsQueryHandler,
    RetrieveGroupPolicyJumpGroupsQueryHandler,
    RetrieveAllGroupPolicyMembersQueryHandler,
    RetrieveGroupPolicyMembersQueryHandler,
    RetrieveAllGroupPolicyTeamsQueryHandler,
    RetrieveGroupPolicyTeamsQueryHandler,
];
