import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { BeyondtrustInstanceEntity } from '../entities';

@Injectable()
export class BeyondtrustInstanceRepositoryService extends BaseRepositoryService<BeyondtrustInstanceEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, BeyondtrustInstanceEntity);
    }

    public async createOrUpdateById(entity: Partial<BeyondtrustInstanceEntity>): Promise<void> {
        await super.createOrUpdate(entity, ['id']);
    }

    public async findOneById(id: number): Promise<BeyondtrustInstanceEntity | null> {
        return await super.findOneBy({ id: id });
    }

    public async deleteById(id: number): Promise<void> {
        return await super.deleteBy({ id: id });
    }
}
