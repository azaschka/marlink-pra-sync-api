import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { GroupPolicyTeamEntity } from '../entities';

@Injectable()
export class GroupPolicyTeamRepositoryService extends BaseRepositoryService<GroupPolicyTeamEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, GroupPolicyTeamEntity);
    }

    public async createOrUpdateByGroupPolicyIdAndTeamId(entities: Partial<GroupPolicyTeamEntity>[]): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(entities, ['groupPolicyId', 'teamId']);
    }

    public async deleteByGroupPolicyId(groupPolicyId: number): Promise<void> {
        await super.deleteBy({ groupPolicyId: groupPolicyId });
    }

    public async deleteByGroupPolicyIdAndTeamId(groupPolicyId: number, teamId: number): Promise<void> {
        await super.deleteBy({ groupPolicyId: groupPolicyId, teamId: teamId });
    }

    public async deleteByGroupPolicyIds(groupPolicyIds: number[]): Promise<void> {
        if (groupPolicyIds.length === 0) {
            return;
        }

        await super.deleteBy({ groupPolicyId: In(groupPolicyIds) });
    }
}
