import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../models';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { RetrieveUserByIdQuery } from '../retrieve-user-by-id.query';

@QueryHandler(RetrieveUserByIdQuery)
export class RetrieveUserByIdQueryHandler implements IQueryHandler<RetrieveUserByIdQuery> {
    constructor(private readonly userRepositoryService: UserRepositoryService) {}

    public async execute(query: RetrieveUserByIdQuery): Promise<User> {
        const user = await this.userRepositoryService.findOneById(query.tenantId, query.id);

        if (!user) {
            throw new NotFoundException(`User with ID ${query.id} not found.`);
        }

        return user;
    }
}
