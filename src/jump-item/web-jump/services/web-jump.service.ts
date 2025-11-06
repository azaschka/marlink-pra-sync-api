import { Injectable } from '@nestjs/common';
import { WebJumpEntity } from '../repositories/entities';
import { WebJumpRepositoryService } from '../repositories/services/web-jump-repository.service';

@Injectable()
export class WebJumpService {
    constructor(private readonly webJumpRepositoryService: WebJumpRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<WebJumpEntity>): Promise<void> {
        await this.webJumpRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.webJumpRepositoryService.deleteById(tenantId, id);
    }
}
