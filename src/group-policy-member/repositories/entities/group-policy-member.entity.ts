import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { UserEntity } from '../../../user/repositories/entities';
import { GroupPolicyMember } from '../../models';

export class GroupPolicyMemberEntity implements GroupPolicyMember {
    public groupPolicyId!: number;
    public memberId!: number;
    public userId!: number;
    public securityProviderId!: number;
    public distinguishedName?: string;
    public groupName?: string;
    public groupPolicy?: GroupPolicyEntity;
    public user?: UserEntity;
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
