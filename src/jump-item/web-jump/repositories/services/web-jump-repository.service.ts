import { Injectable } from '@nestjs/common';
import { DataSource, In, LessThan } from 'typeorm';
import { BaseRepositoryService } from '../../../../core/services/base-repository.service';
import { WebJumpEntity } from '../entities';

@Injectable()
export class WebJumpRepositoryService extends BaseRepositoryService<WebJumpEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, WebJumpEntity);
    }

    public async createOrUpdateById(entity: Partial<WebJumpEntity>): Promise<void> {
        await super.createOrUpdate(entity, ['id']);
    }

    public async createOrUpdateByIds(entities: Partial<WebJumpEntity>[]): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(entities, ['id']);
    }

    public async findOneById(id: number): Promise<WebJumpEntity | null> {
        return await super.findOneBy({ id: id });
    }

    public async findByIds(ids: number[]): Promise<WebJumpEntity[]> {
        if (ids.length === 0) {
            return [];
        }

        return await super.findBy({ id: In(ids) }, 1, ids.length);
    }

    public async findByLastSyncDateBefore(date: Date, pageNumber: number, pageSize: number): Promise<WebJumpEntity[]> {
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
