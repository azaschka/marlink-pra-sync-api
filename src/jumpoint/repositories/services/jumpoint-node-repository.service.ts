import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { JumpointNodeEntity } from '../entities';

@Injectable()
export class JumpointNodeRepositoryService extends BaseRepositoryService<JumpointNodeEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, JumpointNodeEntity);
    }

    public async createOrUpdateByIdAndJumpointId(entities: Partial<JumpointNodeEntity>[]): Promise<void> {
        if (entities.length === 0) {
            return;
        }

        await super.createOrUpdate(entities, ['id', 'jumpointId']);
    }

    public async deleteByJumpointIds(jumpointIds: number[]): Promise<void> {
        if (jumpointIds.length === 0) {
            return;
        }

        await super.deleteBy({ jumpointId: In(jumpointIds) });
    }

    public async deleteByJumpointId(jumpointId: number): Promise<void> {
        await super.deleteBy({ jumpointId: jumpointId });
    }
}
