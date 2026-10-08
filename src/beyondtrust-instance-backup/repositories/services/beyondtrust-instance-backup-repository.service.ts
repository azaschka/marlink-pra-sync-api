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

    /** Every backup, per instance newest first (the order the backup retention relies on). */
    public async findAllNewestFirstPerInstance(): Promise<BeyondtrustInstanceBackupEntity[]> {
        return await super.findBy({}, undefined, undefined, {
            beyondtrustInstanceId: 'ASC',
            creationDate: 'DESC',
            id: 'DESC',
        });
    }

    public async deleteById(id: number): Promise<void> {
        return await super.deleteBy({ id: id });
    }
}
