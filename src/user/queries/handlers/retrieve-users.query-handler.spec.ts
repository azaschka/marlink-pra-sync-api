import { UserEntity } from '../../repositories/entities';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { RetrieveUsersQuery } from '../retrieve-users.query';
import { RetrieveUsersQueryHandler } from './retrieve-users.query-handler';

describe('RetrieveUsersQueryHandler', () => {
    let userRepositoryService: UserRepositoryService;
    let handler: RetrieveUsersQueryHandler;

    beforeEach(() => {
        userRepositoryService = mockUserRepositoryService();
        handler = new RetrieveUsersQueryHandler(userRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedUsers = [] as UserEntity[];
            const userRepositoryServiceFindByMethod = jest
                .spyOn(userRepositoryService, 'findBy')
                .mockResolvedValue(expectedUsers);

            const result = await handler.execute(new RetrieveUsersQuery('transaction-1', 123, 20, 2));

            expect(result).toBe(expectedUsers);
            expect(userRepositoryServiceFindByMethod).toHaveBeenCalledWith(123, {}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedUsers = [] as UserEntity[];
            const userRepositoryServiceFindByMethod = jest
                .spyOn(userRepositoryService, 'findBy')
                .mockResolvedValue(expectedUsers);

            const result = await handler.execute(
                new RetrieveUsersQuery('transaction-2', 123, 10, 1, 123, 'user1', 'user1@email.com'),
            );

            expect(result).toBe(expectedUsers);
            expect(userRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                123,
                { securityProviderId: 123, username: 'user1', email: 'user1@email.com' },
                1,
                10,
            );
        });
    });
});

function mockUserRepositoryService() {
    const service = {} as UserRepositoryService;
    service.findBy = jest.fn();

    return service;
}
