import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { UserGroupPolicyEntity } from '../entities';
import { UserGroupPolicySchemaFactory } from '../factories';

@Injectable()
export class UserGroupPolicyRepositoryService extends BaseTenantRepositoryService<UserGroupPolicyEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, new UserGroupPolicySchemaFactory());
    }

    public async createOrUpdateByUserIdAndGroupPolicyId(
        tenantId: number,
        entities: Partial<UserGroupPolicyEntity>[],
    ): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(tenantId, entities, ['userId', 'groupPolicyId']);
    }

    public async deleteByUserIdAndGroupPolicyId(
        tenantId: number,
        userId: number,
        groupPolicyId: number,
    ): Promise<void> {
        await super.deleteBy(tenantId, { userId: userId, groupPolicyId: groupPolicyId });
    }

    public async deleteByUserId(tenantId: number, userId: number): Promise<void> {
        await super.deleteBy(tenantId, { userId: userId });
    }

    public async deleteByUserIds(tenantId: number, userIds: number[]): Promise<void> {
        if (userIds.length === 0) {
            return;
        }

        await super.deleteBy(tenantId, { userId: In(userIds) });
    }
}
