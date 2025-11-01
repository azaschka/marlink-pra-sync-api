import { NotFoundException } from '@nestjs/common';
import { JumpClientEntity } from '../../repositories/entities';
import { JumpClientRepositoryService } from '../../repositories/services/jump-client-repository.service';
import { RetrieveJumpClientByIdQuery } from '../retrieve-jump-client-by-id.query';
import { RetrieveJumpClientByIdQueryHandler } from './retrieve-jump-client-by-id.query-handler';

describe('RetrieveJumpClientByIdQueryHandler', () => {
    let jumpClientRepositoryService: JumpClientRepositoryService;
    let handler: RetrieveJumpClientByIdQueryHandler;

    beforeEach(() => {
        jumpClientRepositoryService = mockJumpClientRepositoryService();
        handler = new RetrieveJumpClientByIdQueryHandler(jumpClientRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(jumpClientRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(handler.execute(new RetrieveJumpClientByIdQuery('transaction-1', 1, 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return value from the repo', async () => {
            const expectedJumpClient = { id: 123 } as JumpClientEntity;
            const jumpClientRepositoryServiceFindOneByIdMethod = jest
                .spyOn(jumpClientRepositoryService, 'findOneById')
                .mockResolvedValue(expectedJumpClient);

            const result = await handler.execute(new RetrieveJumpClientByIdQuery('transaction-1', 1, 123));

            expect(result).toBe(expectedJumpClient);
            expect(jumpClientRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(1, 123);
        });
    });
});

function mockJumpClientRepositoryService() {
    const service = {} as JumpClientRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
