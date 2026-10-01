import { Injectable } from '@nestjs/common';
import { DataSource, LessThan } from 'typeorm';
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

    public async findOneByEntityTypeEntityIdAndForeignEntityId(
        tenantId: number,
        entityType: DiscrepancyEntityType,
        entityId: number,
        foreignEntityId: number,
    ): Promise<DiscrepancyEntity | null> {
        return await super.findOneBy(tenantId, { entityType, entityId, foreignEntityId });
    }

    /**
     * Fetches all discrepancy records for a given entity type without pagination.
     * Used to pre-build a lookup Map before bulk upsert operations,
     * replacing N individual findOne calls with a single query (O(n) → O(1) per item).
     */
    public async findManyByEntityType(
        tenantId: number,
        entityType: DiscrepancyEntityType,
    ): Promise<DiscrepancyEntity[]> {
        return await super.findBy(tenantId, { entityType }, undefined, undefined);
    }

    /**
     * Fetches all relational discrepancy records for a given entity type scoped to a parent entityId.
     * Used to pre-build a foreignEntityId → id lookup Map per parent,
     * replacing N individual findOne calls per parent iteration.
     */
    public async findManyByEntityTypeAndEntityId(
        tenantId: number,
        entityType: DiscrepancyEntityType,
        entityId: number,
    ): Promise<DiscrepancyEntity[]> {
        return await super.findBy(tenantId, { entityType, entityId }, undefined, undefined);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await super.deleteBy(tenantId, { id: id });
    }

    /** Cleanup of one relation parent: only records of that parent that were not refreshed since the date. */
    public async deleteByEntityIdAndLastModificationDateBefore(
        tenantId: number,
        entityType: DiscrepancyEntityType,
        entityId: number,
        date: Date,
    ): Promise<void> {
        return await super.deleteBy(tenantId, {
            entityType: entityType,
            entityId: entityId,
            lastModificationDate: LessThan(date),
        });
    }

    public async deleteByLastModificationDateBefore(
        tenantId: number,
        entityType: DiscrepancyEntityType,
        date: Date,
    ): Promise<void> {
        return await super.deleteBy(tenantId, { entityType: entityType, lastModificationDate: LessThan(date) });
    }
}
