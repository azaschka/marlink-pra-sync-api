import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { GroupPolicyJumpGroupEntity } from '../entities';
import { GroupPolicyJumpGroupSchemaFactory } from '../factories';

@Injectable()
export class GroupPolicyJumpGroupRepositoryService extends BaseTenantRepositoryService<GroupPolicyJumpGroupEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, new GroupPolicyJumpGroupSchemaFactory());
    }

    public async createOrUpdateByGroupPolicyIdAndJumpGroupId(
        tenantId: number,
        entities: Partial<GroupPolicyJumpGroupEntity>[],
    ): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(tenantId, entities, ['groupPolicyId', 'jumpGroupId']);
    }

    public async deleteByGroupPolicyId(tenantId: number, groupPolicyId: number): Promise<void> {
        await super.deleteBy(tenantId, { groupPolicyId: groupPolicyId });
    }

    public async deleteByGroupPolicyIdAndJumpGroupId(
        tenantId: number,
        groupPolicyId: number,
        jumpGroupId: number,
    ): Promise<void> {
        await super.deleteBy(tenantId, { groupPolicyId: groupPolicyId, jumpGroupId: jumpGroupId });
    }

    public async deleteByGroupPolicyIds(tenantId: number, groupPolicyIds: number[]): Promise<void> {
        if (groupPolicyIds.length === 0) {
            return;
        }

        await super.deleteBy(tenantId, { groupPolicyId: In(groupPolicyIds) });
    }
}
