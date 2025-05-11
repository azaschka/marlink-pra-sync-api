import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { GroupPolicyEntity } from '../entities';

@Injectable()
export class GroupPolicyRepositoryService extends BaseRepositoryService<GroupPolicyEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, GroupPolicyEntity);
    }

    public async createOrUpdateById(entity: Partial<GroupPolicyEntity>): Promise<void> {
        await super.createOrUpdate(entity, ['id']);
    }

    public async findOneById(id: number): Promise<GroupPolicyEntity | null> {
        return await super.findOneBy({ id: id });
    }

    public async deleteById(id: number): Promise<void> {
        return await super.deleteBy({ id: id });
    }
}
