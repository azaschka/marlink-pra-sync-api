import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { JumpointNodeEntity } from '../entities';
import { JumpointNodeSchemaFactory } from '../factories';

@Injectable()
export class JumpointNodeRepositoryService extends BaseTenantRepositoryService<JumpointNodeEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, new JumpointNodeSchemaFactory());
    }

    public async createOrUpdateById(tenantId: number, entity: Partial<JumpointNodeEntity>): Promise<void> {
        await super.createOrUpdate(tenantId, entity, ['id']);
    }

    public async createOrUpdateByIdAndJumpointId(
        tenantId: number,
        entities: Partial<JumpointNodeEntity>[],
    ): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(tenantId, entities, ['id', 'jumpointId']);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await super.deleteBy(tenantId, { id: id });
    }

    public async deleteByJumpointIds(tenantId: number, jumpointIds: number[]): Promise<void> {
        if (jumpointIds.length === 0) {
            return;
        }

        await super.deleteBy(tenantId, { jumpointId: In(jumpointIds) });
    }

    public async deleteByJumpointId(tenantId: number, jumpointId: number): Promise<void> {
        await super.deleteBy(tenantId, { jumpointId: jumpointId });
    }
}
