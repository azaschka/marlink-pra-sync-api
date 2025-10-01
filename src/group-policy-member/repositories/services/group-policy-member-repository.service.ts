import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { GroupPolicyMemberEntity } from '../entities';
import { GroupPolicyMemberSchemaFactory } from '../factories';

@Injectable()
export class GroupPolicyMemberRepositoryService extends BaseTenantRepositoryService<GroupPolicyMemberEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, new GroupPolicyMemberSchemaFactory());
    }

    public async createOrUpdateByGroupPolicyIdAndMemberId(
        tenantId: number,
        entities: Partial<GroupPolicyMemberEntity>[],
    ): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(tenantId, entities, ['groupPolicyId', 'memberId']);
    }

    public async deleteByGroupPolicyId(tenantId: number, groupPolicyId: number): Promise<void> {
        await super.deleteBy(tenantId, { groupPolicyId: groupPolicyId });
    }

    public async deleteByGroupPolicyIdAndMemberId(
        tenantId: number,
        groupPolicyId: number,
        memberId: number,
    ): Promise<void> {
        await super.deleteBy(tenantId, { groupPolicyId: groupPolicyId, memberId: memberId });
    }

    public async deleteByGroupPolicyIds(tenantId: number, groupPolicyIds: number[]): Promise<void> {
        if (groupPolicyIds.length === 0) {
            return;
        }

        await super.deleteBy(tenantId, { groupPolicyId: In(groupPolicyIds) });
    }
}
