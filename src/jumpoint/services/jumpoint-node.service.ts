import { Injectable } from '@nestjs/common';
import { JumpointNodeEntity } from '../repositories/entities';
import { JumpointNodeRepositoryService } from '../repositories/services/jumpoint-node-repository.service';

@Injectable()
export class JumpointNodeService {
    constructor(private readonly jumpointNodeRepositoryService: JumpointNodeRepositoryService) {}

    public async createOrUpdateByJumpointIdAndJumpointNodeId(
        tenantId: number,
        entity: Partial<JumpointNodeEntity>,
    ): Promise<void> {
        await this.jumpointNodeRepositoryService.createOrUpdateByJumpointIdAndJumpointNodeId(tenantId, [entity]);
    }

    public async deleteByJumpointIdAndJumpointNodeId(
        tenantId: number,
        jumpointId: number,
        jumpointNodeId: number,
    ): Promise<void> {
        return await this.jumpointNodeRepositoryService.deleteByJumpointIdAndJumpointNodeId(
            tenantId,
            jumpointId,
            jumpointNodeId,
        );
    }
}
