import { GroupPolicyJumpGroupSaga } from './group-policy-jump-group.saga';
import { GroupPolicyJumpointSaga } from './group-policy-jumpoint.saga';
import { GroupPolicyMemberSaga } from './group-policy-member.saga';
import { GroupPolicyTeamSaga } from './group-policy-team.saga';
import { JumpointSaga } from './jumpoint.saga';
import { TeamUserSaga } from './team-user.saga';
import { UserGroupPolicySaga } from './user-group-policy.saga';

export const Sagas = [
    JumpointSaga,
    GroupPolicyJumpointSaga,
    GroupPolicyMemberSaga,
    GroupPolicyJumpGroupSaga,
    GroupPolicyTeamSaga,
    TeamUserSaga,
    UserGroupPolicySaga,
];
