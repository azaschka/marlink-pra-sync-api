import { NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../repositories/entities';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { RetrieveUserByIdQuery } from '../retrieve-user-by-id.query';
import { RetrieveUserByIdQueryHandler } from './retrieve-user-by-id.query-handler';

describe('RetrieveUserByIdQueryHandler', () => {
    let userRepositoryService: UserRepositoryService;
    let handler: RetrieveUserByIdQueryHandler;

    beforeEach(() => {
        userRepositoryService = mockUserRepositoryService();
        handler = new RetrieveUserByIdQueryHandler(userRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(userRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(handler.execute(new RetrieveUserByIdQuery('transaction-1', 1, 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return value from the repo', async () => {
            const expectedUser = { id: 123 } as UserEntity;
            const userRepositoryServiceFindOneByIdMethod = jest
                .spyOn(userRepositoryService, 'findOneById')
                .mockResolvedValue(expectedUser);

            const result = await handler.execute(new RetrieveUserByIdQuery('transaction-1', 1, 123));

            expect(result).toBe(expectedUser);
            expect(userRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(1, 123);
        });
    });
});

function mockUserRepositoryService() {
    const service = {} as UserRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
