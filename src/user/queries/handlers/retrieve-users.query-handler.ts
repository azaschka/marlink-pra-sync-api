import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../models';
import { UserEntity } from '../../repositories/entities';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { RetrieveUsersQuery } from '../retrieve-users.query';

@QueryHandler(RetrieveUsersQuery)
export class RetrieveUsersQueryHandler implements IQueryHandler<RetrieveUsersQuery> {
    constructor(private readonly userRepositoryService: UserRepositoryService) {}

    public async execute(query: RetrieveUsersQuery): Promise<User[]> {
        const userFindByQuery = <UserEntity>{};

        if (query.securityProviderId !== undefined) {
            userFindByQuery.securityProviderId = query.securityProviderId;
        }

        if (query.username) {
            userFindByQuery.username = query.username;
        }

        if (query.email) {
            userFindByQuery.email = query.email;
        }

        const users = await this.userRepositoryService.findBy(
            query.tenantId,
            userFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return users;
    }
}
