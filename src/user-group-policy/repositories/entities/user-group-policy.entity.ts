import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { UserEntity } from '../../../user/repositories/entities';
import { UserGroupPolicy } from '../../models';

export class UserGroupPolicyEntity implements UserGroupPolicy {
    public userId!: number;
    public groupPolicyId!: number;
    public user?: UserEntity;
    public groupPolicy?: GroupPolicyEntity;
    public lastSyncDate!: Date;

    public static create(userId: number, groupPolicyIds: number[]): UserGroupPolicyEntity[] {
        const lastSyncDate = DateUtility.getCurrentUtcDate();

        return groupPolicyIds.map((groupPolicyId) => {
            const entity = new UserGroupPolicyEntity();
            entity.userId = userId;
            entity.groupPolicyId = groupPolicyId;
            entity.user = { id: userId } as UserEntity; // Stub UserEntity with only the id
            entity.groupPolicy = { id: groupPolicyId } as GroupPolicyEntity; // Stub GroupPolicyEntity with only the id
            entity.lastSyncDate = lastSyncDate;

            return entity;
        });
    }
}
