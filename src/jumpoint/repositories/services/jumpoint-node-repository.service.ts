import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { JumpointNodeEntity } from '../entities';
import { JumpointNodeSchemaFactory } from '../factories';

@Injectable()
export class JumpointNodeRepositoryService extends BaseTenantRepositoryService<JumpointNodeEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, new JumpointNodeSchemaFactory());
    }

    public async createOrUpdateByJumpointIdAndJumpointNodeId(
        tenantId: number,
        entities: Partial<JumpointNodeEntity>[],
    ): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(tenantId, entities, ['id', 'jumpointId']);
    }

    public async deleteByJumpointIdAndJumpointNodeId(
        tenantId: number,
        jumpointId: number,
        jumpointNodeId: number,
    ): Promise<void> {
        await super.deleteBy(tenantId, { jumpointId: jumpointId, id: jumpointNodeId });
    }
}
