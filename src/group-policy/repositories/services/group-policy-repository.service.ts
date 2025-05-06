import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { GroupPolicyEntity } from '../entities';

@Injectable()
export class GroupPolicyRepositoryService extends BaseRepositoryService<GroupPolicyEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, GroupPolicyEntity);
    }
}
