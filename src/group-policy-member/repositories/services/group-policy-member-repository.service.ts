import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { GroupPolicyMemberEntity } from '../entities';

@Injectable()
export class GroupPolicyMemberRepositoryService extends BaseRepositoryService<GroupPolicyMemberEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, GroupPolicyMemberEntity);
    }

    public async createOrUpdateByGroupPolicyIdAndMemberId(entities: Partial<GroupPolicyMemberEntity>[]): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(entities, ['groupPolicyId', 'memberId']);
    }

    public async deleteByGroupPolicyId(groupPolicyId: number): Promise<void> {
        await super.deleteBy({ groupPolicyId: groupPolicyId });
    }

    public async deleteByGroupPolicyIdAndMemberId(groupPolicyId: number, memberId: number): Promise<void> {
        await super.deleteBy({ groupPolicyId: groupPolicyId, memberId: memberId });
    }

    public async deleteByGroupPolicyIds(groupPolicyIds: number[]): Promise<void> {
        if (groupPolicyIds.length === 0) {
            return;
        }

        await super.deleteBy({ groupPolicyId: In(groupPolicyIds) });
    }
}
