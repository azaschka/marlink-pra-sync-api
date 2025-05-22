import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { JumpPolicyEntity } from '../entities';

@Injectable()
export class JumpPolicyRepositoryService extends BaseRepositoryService<JumpPolicyEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, JumpPolicyEntity);
    }

    public async createOrUpdateById(entity: Partial<JumpPolicyEntity>): Promise<void> {
        await super.createOrUpdate(entity, ['id']);
    }

    public async findOneById(id: number): Promise<JumpPolicyEntity | null> {
        return await super.findOneBy({ id: id });
    }

    public async deleteById(id: number): Promise<void> {
        return await super.deleteBy({ id: id });
    }
}
