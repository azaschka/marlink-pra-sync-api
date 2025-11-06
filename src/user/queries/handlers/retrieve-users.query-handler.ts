import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, Like } from 'typeorm';
import { User } from '../../models';
import { UserEntity } from '../../repositories/entities';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { RetrieveUsersQuery } from '../retrieve-users.query';

@QueryHandler(RetrieveUsersQuery)
export class RetrieveUsersQueryHandler implements IQueryHandler<RetrieveUsersQuery> {
    constructor(private readonly userRepositoryService: UserRepositoryService) {}

    public async execute(query: RetrieveUsersQuery): Promise<User[]> {
        const multipleWhere: FindOptionsWhere<UserEntity>[] = [];
        const singleWhere: FindOptionsWhere<UserEntity> = {};

        if (query.securityProviderId !== undefined) {
            singleWhere.securityProviderId = query.securityProviderId;
        }

        if (query.username) {
            singleWhere.username = query.username;
        }

        if (query.email) {
            singleWhere.email = query.email;
        }

        // handle multiple LIKE patterns properly
        if (query.publicDisplayNamePatterns && query.publicDisplayNamePatterns.length > 0) {
            for (const pattern of query.publicDisplayNamePatterns) {
                multipleWhere.push({
                    ...singleWhere, // retain other filters
                    publicDisplayName: Like(pattern),
                });
            }
        } else {
            multipleWhere.push(singleWhere);
        }

        const users = await this.userRepositoryService.findBy(
            query.tenantId,
            multipleWhere,
            query.pageNumber,
            query.pageSize,
        );

        return users;
    }
}
