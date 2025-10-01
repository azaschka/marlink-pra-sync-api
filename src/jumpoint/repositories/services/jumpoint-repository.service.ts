import { Injectable } from '@nestjs/common';
import { DataSource, In, LessThan } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { JumpointEntity } from '../entities';
import { JumpointSchemaFactory } from '../factories';

@Injectable()
export class JumpointRepositoryService extends BaseTenantRepositoryService<JumpointEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, new JumpointSchemaFactory());
    }

    public async createOrUpdateById(tenantId: number, entity: Partial<JumpointEntity>): Promise<void> {
        await super.createOrUpdate(tenantId, entity, ['id']);
    }

    public async createOrUpdateByIds(tenantId: number, entities: Partial<JumpointEntity>[]): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(tenantId, entities, ['id']);
    }

    public async findOneById(tenantId: number, id: number): Promise<JumpointEntity | null> {
        return await super.findOneBy(tenantId, { id: id });
    }

    public async findByIds(tenantId: number, ids: number[]): Promise<JumpointEntity[]> {
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
    ): Promise<JumpointEntity[]> {
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
