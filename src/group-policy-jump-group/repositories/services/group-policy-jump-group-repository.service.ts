import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { GroupPolicyJumpGroupEntity } from '../entities';

@Injectable()
export class GroupPolicyJumpGroupRepositoryService extends BaseRepositoryService<GroupPolicyJumpGroupEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, GroupPolicyJumpGroupEntity);
    }

    public async createOrUpdateByGroupPolicyIdAndJumpGroupId(
        entities: Partial<GroupPolicyJumpGroupEntity>[],
    ): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(entities, ['groupPolicyId', 'jumpGroupId']);
    }

    public async deleteByGroupPolicyId(groupPolicyId: number): Promise<void> {
        await super.deleteBy({ groupPolicyId: groupPolicyId });
    }

    public async deleteByGroupPolicyIdAndJumpGroupId(groupPolicyId: number, jumpGroupId: number): Promise<void> {
        await super.deleteBy({ groupPolicyId: groupPolicyId, jumpGroupId: jumpGroupId });
    }

    public async deleteByGroupPolicyIds(groupPolicyIds: number[]): Promise<void> {
        if (groupPolicyIds.length === 0) {
            return;
        }

        await super.deleteBy({ groupPolicyId: In(groupPolicyIds) });
    }
}
