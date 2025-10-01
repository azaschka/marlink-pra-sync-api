import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { GroupPolicyTeamEntity } from '../entities';
import { GroupPolicyTeamSchemaFactory } from '../factories';

@Injectable()
export class GroupPolicyTeamRepositoryService extends BaseTenantRepositoryService<GroupPolicyTeamEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, new GroupPolicyTeamSchemaFactory());
    }

    public async createOrUpdateByGroupPolicyIdAndTeamId(
        tenantId: number,
        entities: Partial<GroupPolicyTeamEntity>[],
    ): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(tenantId, entities, ['groupPolicyId', 'teamId']);
    }

    public async deleteByGroupPolicyId(tenantId: number, groupPolicyId: number): Promise<void> {
        await super.deleteBy(tenantId, { groupPolicyId: groupPolicyId });
    }

    public async deleteByGroupPolicyIdAndTeamId(
        tenantId: number,
        groupPolicyId: number,
        teamId: number,
    ): Promise<void> {
        await super.deleteBy(tenantId, { groupPolicyId: groupPolicyId, teamId: teamId });
    }

    public async deleteByGroupPolicyIds(tenantId: number, groupPolicyIds: number[]): Promise<void> {
        if (groupPolicyIds.length === 0) {
            return;
        }

        await super.deleteBy(tenantId, { groupPolicyId: In(groupPolicyIds) });
    }
}
