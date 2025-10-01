import { Injectable } from '@nestjs/common';
import { DataSource, In, LessThan } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { UserEntity } from '../entities';
import { UserSchemaFactory } from '../factories';

@Injectable()
export class UserRepositoryService extends BaseTenantRepositoryService<UserEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, new UserSchemaFactory());
    }

    public async createOrUpdateById(tenantId: number, entity: Partial<UserEntity>): Promise<void> {
        await super.createOrUpdate(tenantId, entity, ['id']);
    }

    public async createOrUpdateByIds(tenantId: number, entities: Partial<UserEntity>[]): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(tenantId, entities, ['id']);
    }

    public async findOneById(tenantId: number, id: number): Promise<UserEntity | null> {
        return await super.findOneBy(tenantId, { id: id });
    }

    public async findByIds(tenantId: number, ids: number[]): Promise<UserEntity[]> {
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
    ): Promise<UserEntity[]> {
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
