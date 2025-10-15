import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { SyncEntityType } from '../../enums';
import { SyncDiscrepancyEntity } from '../entities';

@Injectable()
export class SyncDiscrepancyRepositoryService extends BaseRepositoryService<SyncDiscrepancyEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, SyncDiscrepancyEntity);
    }

    public async createOrUpdateById(entity: Partial<SyncDiscrepancyEntity>): Promise<void> {
        await super.createOrUpdate(entity, ['id']);
    }

    public async findOneById(id: number): Promise<SyncDiscrepancyEntity | null> {
        return await super.findOneBy({ id: id });
    }

    public async findOneByBTIdEntityTypeAndEntityId(
        beyondtrustInstanceId: number,
        entityType: SyncEntityType,
        entityId: number,
    ): Promise<SyncDiscrepancyEntity | null> {
        return await super.findOneBy({ beyondtrustInstanceId, entityType, entityId });
    }

    public async deleteById(id: number): Promise<void> {
        return await super.deleteBy({ id: id });
    }
}
