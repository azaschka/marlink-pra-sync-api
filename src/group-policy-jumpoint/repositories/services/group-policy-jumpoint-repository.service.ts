import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { GroupPolicyJumpointEntity } from '../entities';

@Injectable()
export class GroupPolicyJumpointRepositoryService extends BaseRepositoryService<GroupPolicyJumpointEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, GroupPolicyJumpointEntity);
    }

    public async createOrUpdateByGroupPolicyIdAndJumpointId(
        entities: Partial<GroupPolicyJumpointEntity>[],
    ): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(entities, ['groupPolicyId', 'jumpointId']);
    }

    public async deleteByGroupPolicyId(groupPolicyId: number): Promise<void> {
        await super.deleteBy({ groupPolicyId: groupPolicyId });
    }

    public async deleteByGroupPolicyIdAndJumpointId(groupPolicyId: number, jumpointId: number): Promise<void> {
        await super.deleteBy({ groupPolicyId: groupPolicyId, jumpointId: jumpointId });
    }

    public async deleteByGroupPolicyIds(groupPolicyIds: number[]): Promise<void> {
        if (groupPolicyIds.length === 0) {
            return;
        }

        await super.deleteBy({ groupPolicyId: In(groupPolicyIds) });
    }
}
