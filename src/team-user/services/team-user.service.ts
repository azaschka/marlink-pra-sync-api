import { Injectable } from '@nestjs/common';
import { TeamUserEntity } from '../repositories/entities';
import { TeamUserRepositoryService } from '../repositories/services/team-user-repository.service';

@Injectable()
export class TeamUserService {
    constructor(private readonly teamUserRepositoryService: TeamUserRepositoryService) {}

    public async createOrUpdateByTeamIdAndUserId(tenantId: number, entity: Partial<TeamUserEntity>): Promise<void> {
        await this.teamUserRepositoryService.createOrUpdateByTeamIdAndUserId(tenantId, [entity]);
    }

    public async deleteByTeamIdAndUserId(tenantId: number, teamId: number, userId: number): Promise<void> {
        await this.teamUserRepositoryService.deleteByTeamIdAndUserId(tenantId, teamId, userId);
    }
}
