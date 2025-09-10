import { Injectable } from '@nestjs/common';
import { DataSource, In, LessThan } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { GroupPolicyEntity } from '../entities';
import { GroupPolicySchemaFactory } from '../factories';

@Injectable()
export class GroupPolicyRepositoryService extends BaseTenantRepositoryService<GroupPolicyEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, new GroupPolicySchemaFactory());
    }

    public async createOrUpdateById(tenantId: number, entity: Partial<GroupPolicyEntity>): Promise<void> {
        await super.createOrUpdate(tenantId, entity, ['id']);
    }

    public async createOrUpdateByIds(tenantId: number, entities: Partial<GroupPolicyEntity>[]): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(tenantId, entities, ['id']);
    }

    public async findOneById(tenantId: number, id: number): Promise<GroupPolicyEntity | null> {
        return await super.findOneBy(tenantId, { id: id });
    }

    public async findByIds(tenantId: number, ids: number[]): Promise<GroupPolicyEntity[]> {
        if (ids.length === 0) {
            return [];
        }

        return await super.findBy(tenantId, { id: In(ids) }, 1, ids.length);
    }

    public async findByLastSyncDateBefore(
        tenantId: number,
        date: Date,
        pageNumber: number,
        pageSize: number,
    ): Promise<GroupPolicyEntity[]> {
        return await super.findBy(tenantId, { lastSyncDate: LessThan(date) }, pageNumber, pageSize);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await super.deleteBy(tenantId, { id: id });
    }

    public async deleteByIds(tenantId: number, ids: number[]): Promise<void> {
        if (ids.length === 0) {
            return;
        }

        return await super.deleteBy(tenantId, { id: In(ids) });
    }
}
