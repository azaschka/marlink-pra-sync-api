import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { DiscrepancyEntityType } from '../../enums';
import { DiscrepancyEntity } from '../entities';
import { DiscrepancySchemaFactory } from '../factories';

@Injectable()
export class DiscrepancyRepositoryService extends BaseTenantRepositoryService<DiscrepancyEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, new DiscrepancySchemaFactory());
    }

    public async createOrUpdateById(tenantId: number, entity: Partial<DiscrepancyEntity>): Promise<void> {
        await super.createOrUpdate(tenantId, entity, ['id']);
    }

    public async findOneById(tenantId: number, id: number): Promise<DiscrepancyEntity | null> {
        return await super.findOneBy(tenantId, { id: id });
    }

    public async findOneByEntityTypeAndEntityId(
        tenantId: number,
        entityType: DiscrepancyEntityType,
        entityId: number,
    ): Promise<DiscrepancyEntity | null> {
        return await super.findOneBy(tenantId, { entityType, entityId });
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await super.deleteBy(tenantId, { id: id });
    }
}
