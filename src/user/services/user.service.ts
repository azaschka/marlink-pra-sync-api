import { Injectable } from '@nestjs/common';
import { UserEntity } from '../repositories/entities';
import { UserRepositoryService } from '../repositories/services/user-repository.service';

@Injectable()
export class UserService {
    constructor(private readonly userRepositoryService: UserRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<UserEntity>): Promise<void> {
        await this.userRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.userRepositoryService.deleteById(tenantId, id);
    }
}
