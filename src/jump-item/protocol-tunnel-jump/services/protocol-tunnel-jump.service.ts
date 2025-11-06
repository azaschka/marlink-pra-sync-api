import { Injectable } from '@nestjs/common';
import { ProtocolTunnelJumpEntity } from '../repositories/entities';
import { ProtocolTunnelJumpRepositoryService } from '../repositories/services/protocol-tunnel-jump-repository.service';

@Injectable()
export class ProtocolTunnelJumpService {
    constructor(private readonly protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<ProtocolTunnelJumpEntity>): Promise<void> {
        await this.protocolTunnelJumpRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.protocolTunnelJumpRepositoryService.deleteById(tenantId, id);
    }
}
