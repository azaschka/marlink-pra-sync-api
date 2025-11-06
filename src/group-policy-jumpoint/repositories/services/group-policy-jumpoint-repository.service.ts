import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { GroupPolicyJumpointEntity } from '../entities';
import { GroupPolicyJumpointSchemaFactory } from '../factories';

@Injectable()
export class GroupPolicyJumpointRepositoryService extends BaseTenantRepositoryService<GroupPolicyJumpointEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, new GroupPolicyJumpointSchemaFactory());
    }

    public async createOrUpdateByGroupPolicyIdAndJumpointId(
        tenantId: number,
        entities: Partial<GroupPolicyJumpointEntity>[],
    ): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(tenantId, entities, ['groupPolicyId', 'jumpointId']);
    }

    public async deleteByGroupPolicyId(tenantId: number, groupPolicyId: number): Promise<void> {
        await super.deleteBy(tenantId, { groupPolicyId: groupPolicyId });
    }

    public async deleteByGroupPolicyIdAndJumpointId(
        tenantId: number,
        groupPolicyId: number,
        jumpointId: number,
    ): Promise<void> {
        await super.deleteBy(tenantId, { groupPolicyId: groupPolicyId, jumpointId: jumpointId });
    }

    public async deleteByGroupPolicyIds(tenantId: number, groupPolicyIds: number[]): Promise<void> {
        if (groupPolicyIds.length === 0) {
            return;
        }

        await super.deleteBy(tenantId, { groupPolicyId: In(groupPolicyIds) });
    }
}
