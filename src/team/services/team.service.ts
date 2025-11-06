import { Injectable } from '@nestjs/common';
import { TeamEntity } from '../repositories/entities';
import { TeamRepositoryService } from '../repositories/services/team-repository.service';

@Injectable()
export class TeamService {
    constructor(private readonly teamRepositoryService: TeamRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<TeamEntity>): Promise<void> {
        await this.teamRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.teamRepositoryService.deleteById(tenantId, id);
    }
}
