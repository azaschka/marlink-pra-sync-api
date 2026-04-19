import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepositoryService } from '../../../../core/services/base-repository.service';
import { JumpointNodeEntity } from '../entities';

@Injectable()
export class JumpointNodeRepositoryService extends BaseRepositoryService<JumpointNodeEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, JumpointNodeEntity);
    }

    public async createOrUpdateById(entity: Partial<JumpointNodeEntity>): Promise<void> {
        await super.createOrUpdate(entity, ['id']);
    }

    public async findOneById(id: number): Promise<JumpointNodeEntity | null> {
        return await super.findOneBy({ id: id });
    }

    public async deleteById(id: number): Promise<void> {
        return await super.deleteBy({ id: id });
    }
}
