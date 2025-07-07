import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { UserEntity } from '../../../user/repositories/entities';
import { GroupPolicyMember } from '../../models';

@Entity({ name: 'group_policy_members' })
export class GroupPolicyMemberEntity implements GroupPolicyMember {
    @PrimaryColumn({ name: 'group_policy_id', type: 'int' })
    public groupPolicyId!: number;

    @PrimaryColumn({ name: 'member_id', type: 'int' })
    public memberId!: number;

    @Column({ name: 'user_id', type: 'int' })
    public userId!: number;

    @Column({ name: 'security_provider_id', type: 'int' })
    public securityProviderId!: number;

    @Column({ name: 'distinguished_name', type: 'text', nullable: true })
    public distinguishedName?: string;

    @Column({ name: 'group_name', type: 'varchar', nullable: true })
    public groupName?: string;

    @ManyToOne(() => GroupPolicyEntity, (groupPolicy) => groupPolicy.groupPolicyMembers)
    @JoinColumn({ name: 'group_policy_id' })
    public groupPolicy!: GroupPolicyEntity;

    @ManyToOne(() => UserEntity, (user) => user.groupPolicyMembers, { eager: true })
    @JoinColumn({ name: 'user_id' })
    public user!: UserEntity;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    public static create(
        groupPolicyId: number,
        memberId: number,
        userId: number,
        securityProviderId: number,
        distinguishedName?: string,
        groupName?: string,
    ): GroupPolicyMemberEntity {
        const entity = new GroupPolicyMemberEntity();
        entity.groupPolicyId = groupPolicyId;
        entity.memberId = memberId;
        entity.userId = userId;
        entity.securityProviderId = securityProviderId;
        entity.distinguishedName = distinguishedName;
        entity.groupName = groupName;
        entity.groupPolicy = { id: groupPolicyId } as GroupPolicyEntity; // Stub GroupPolicyEntity with only the id
        entity.user = { id: userId } as UserEntity; // Stub UserEntity with only the id
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
