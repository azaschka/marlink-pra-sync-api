import { GroupPolicySaga } from './group-policy.saga';
import { JumpointSaga } from './jumpoint.saga';
import { TeamSaga } from './team.saga';
import { UserSaga } from './user.saga';

export const Sagas = [JumpointSaga, GroupPolicySaga, TeamSaga, UserSaga];
