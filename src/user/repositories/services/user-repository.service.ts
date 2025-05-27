import { Injectable } from '@nestjs/common';
import { DataSource, In, LessThan } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { UserEntity } from '../entities';

@Injectable()
export class UserRepositoryService extends BaseRepositoryService<UserEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, UserEntity);
    }

    public async createOrUpdateById(entity: Partial<UserEntity>): Promise<void> {
        await super.createOrUpdate(entity, ['id']);
    }

    public async createOrUpdateByIds(entities: Partial<UserEntity>[]): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(entities, ['id']);
    }

    public async findOneById(id: number): Promise<UserEntity | null> {
        return await super.findOneBy({ id: id });
    }

    public async findByIds(ids: number[]): Promise<UserEntity[]> {
        if (ids.length === 0) {
            return [];
        }

        return await super.findBy({ id: In(ids) }, 1, ids.length);
    }

    public async findByLastSyncDateBefore(date: Date, pageNumber: number, pageSize: number): Promise<UserEntity[]> {
        return await super.findBy({ lastSyncDate: LessThan(date) }, pageNumber, pageSize);
    }

    public async deleteById(id: number): Promise<void> {
        return await super.deleteBy({ id: id });
    }

    public async deleteByIds(ids: number[]): Promise<void> {
        if (ids.length === 0) {
            return;
        }

        return await super.deleteBy({ id: In(ids) });
    }
}
