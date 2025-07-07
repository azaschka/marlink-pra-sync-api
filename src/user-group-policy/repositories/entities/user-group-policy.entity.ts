import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { UserEntity } from '../../../user/repositories/entities';
import { UserGroupPolicy } from '../../models';

@Entity({ name: 'user_group_policies' })
export class UserGroupPolicyEntity implements UserGroupPolicy {
    @PrimaryColumn({ name: 'user_id', type: 'int' })
    public userId!: number;

    @PrimaryColumn({ name: 'group_policy_id', type: 'int' })
    public groupPolicyId!: number;

    @ManyToOne(() => UserEntity, (user) => user.userGroupPolicies)
    @JoinColumn({ name: 'user_id' })
    public user!: UserEntity;

    @ManyToOne(() => GroupPolicyEntity, (groupPolicy) => groupPolicy.userGroupPolicies, { eager: true })
    @JoinColumn({ name: 'group_policy_id' })
    public groupPolicy!: GroupPolicyEntity;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
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
