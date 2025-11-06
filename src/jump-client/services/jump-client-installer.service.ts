import { Injectable } from '@nestjs/common';
import { JumpClientInstallerEntity } from '../repositories/entities';
import { JumpClientInstallerRepositoryService } from '../repositories/services/jump-client-installer-repository.service';

@Injectable()
export class JumpClientInstallerService {
    constructor(private readonly jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<JumpClientInstallerEntity>): Promise<void> {
        await this.jumpClientInstallerRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.jumpClientInstallerRepositoryService.deleteById(tenantId, id);
    }
}
