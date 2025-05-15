import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { TeamEntity } from '../entities';

@Injectable()
export class TeamRepositoryService extends BaseRepositoryService<TeamEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, TeamEntity);
    }

    public async createOrUpdateById(entity: Partial<TeamEntity>): Promise<void> {
        await super.createOrUpdate(entity, ['id']);
    }

    public async findOneById(id: number): Promise<TeamEntity | null> {
        return await super.findOneBy({ id: id });
    }

    public async deleteById(id: number): Promise<void> {
        return await super.deleteBy({ id: id });
    }
}
