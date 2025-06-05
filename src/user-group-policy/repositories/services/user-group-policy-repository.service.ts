import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { UserGroupPolicyEntity } from '../entities';

@Injectable()
export class UserGroupPolicyRepositoryService extends BaseRepositoryService<UserGroupPolicyEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, UserGroupPolicyEntity);
    }

    public async createOrUpdateByUserIdAndGroupPolicyIds(entities: Partial<UserGroupPolicyEntity>[]): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(entities, ['userId', 'groupPolicyId']);
    }

    public async deleteByUserId(userId: number): Promise<void> {
        await super.deleteBy({ userId: userId });
    }

    public async deleteByUserIds(userIds: number[]): Promise<void> {
        if (userIds.length === 0) {
            return;
        }

        await super.deleteBy({ userId: In(userIds) });
    }
}
