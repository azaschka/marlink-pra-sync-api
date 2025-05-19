import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { JumpGroupEntity } from '../entities';

@Injectable()
export class JumpGroupRepositoryService extends BaseRepositoryService<JumpGroupEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, JumpGroupEntity);
    }

    public async createOrUpdateById(entity: Partial<JumpGroupEntity>): Promise<void> {
        await super.createOrUpdate(entity, ['id']);
    }

    public async findOneById(id: number): Promise<JumpGroupEntity | null> {
        return await super.findOneBy({ id: id });
    }

    public async deleteById(id: number): Promise<void> {
        return await super.deleteBy({ id: id });
    }
}
