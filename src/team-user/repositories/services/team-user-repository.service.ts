import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { TeamUserEntity } from '../entities';

@Injectable()
export class TeamUserRepositoryService extends BaseRepositoryService<TeamUserEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, TeamUserEntity);
    }

    public async createOrUpdateByTeamIdAndUserId(entities: Partial<TeamUserEntity>[]): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(entities, ['teamId', 'userId']);
    }

    public async deleteByTeamId(teamId: number): Promise<void> {
        await super.deleteBy({ teamId: teamId });
    }

    public async deleteByTeamIdAndUserId(teamId: number, userId: number): Promise<void> {
        await super.deleteBy({ teamId: teamId, userId: userId });
    }

    public async deleteByTeamIds(teamIds: number[]): Promise<void> {
        if (teamIds.length === 0) {
            return;
        }

        await super.deleteBy({ teamId: In(teamIds) });
    }
}
