import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { TeamUserEntity } from '../entities';
import { TeamUserSchemaFactory } from '../factories';

@Injectable()
export class TeamUserRepositoryService extends BaseTenantRepositoryService<TeamUserEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, new TeamUserSchemaFactory());
    }

    public async createOrUpdateByTeamIdAndUserId(tenantId: number, entities: Partial<TeamUserEntity>[]): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(tenantId, entities, ['teamId', 'userId']);
    }

    public async deleteByTeamId(tenantId: number, teamId: number): Promise<void> {
        await super.deleteBy(tenantId, { teamId: teamId });
    }

    public async deleteByTeamIdAndUserId(tenantId: number, teamId: number, userId: number): Promise<void> {
        await super.deleteBy(tenantId, { teamId: teamId, userId: userId });
    }

    public async deleteByTeamIds(tenantId: number, teamIds: number[]): Promise<void> {
        if (teamIds.length === 0) {
            return;
        }

        await super.deleteBy(tenantId, { teamId: In(teamIds) });
    }
}
