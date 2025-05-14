import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
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

    public async findOneById(id: number): Promise<UserEntity | null> {
        return await super.findOneBy({ id: id });
    }

    public async deleteById(id: number): Promise<void> {
        return await super.deleteBy({ id: id });
    }
}
