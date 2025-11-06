import { Injectable } from '@nestjs/common';
import { ShellJumpEntity } from '../repositories/entities';
import { ShellJumpRepositoryService } from '../repositories/services/shell-jump-repository.service';

@Injectable()
export class ShellJumpService {
    constructor(private readonly shellJumpRepositoryService: ShellJumpRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<ShellJumpEntity>): Promise<void> {
        await this.shellJumpRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.shellJumpRepositoryService.deleteById(tenantId, id);
    }
}
