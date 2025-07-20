import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { BeyondtrustInstanceBackupEntity } from '../entities';

@Injectable()
export class BeyondtrustInstanceBackupRepositoryService extends BaseRepositoryService<BeyondtrustInstanceBackupEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, BeyondtrustInstanceBackupEntity);
    }

    public async createOrUpdateById(entity: Partial<BeyondtrustInstanceBackupEntity>): Promise<void> {
        await super.createOrUpdate(entity, ['id']);
    }

    public async findOneById(id: number): Promise<BeyondtrustInstanceBackupEntity | null> {
        return await super.findOneBy({ id: id });
    }

    public async deleteById(id: number): Promise<void> {
        return await super.deleteBy({ id: id });
    }
}
