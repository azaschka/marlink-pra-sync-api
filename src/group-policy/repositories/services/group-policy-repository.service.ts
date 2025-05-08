import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { GroupPolicyEntity } from '../entities';

@Injectable()
export class GroupPolicyRepositoryService extends BaseRepositoryService<GroupPolicyEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, GroupPolicyEntity);
    }

    public async createOrUpdateByBTId(entity: Partial<GroupPolicyEntity>): Promise<void> {
        await super.createOrUpdate(entity, ['btId']);
    }

    public async findOneByBTId(btId: number): Promise<GroupPolicyEntity | null> {
        return await super.findOneBy({ btId: btId });
    }

    public async deleteByBTId(btId: number): Promise<void> {
        return await super.deleteBy({ btId: btId });
    }
}
