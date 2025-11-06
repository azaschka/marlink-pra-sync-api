import { NotFoundException } from '@nestjs/common';
import { JumpGroupEntity } from '../../repositories/entities';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { RetrieveJumpGroupByIdQuery } from '../retrieve-jump-group-by-id.query';
import { RetrieveJumpGroupByIdQueryHandler } from './retrieve-jump-group-by-id.query-handler';

describe('RetrieveJumpGroupByIdQueryHandler', () => {
    let jumpGroupRepositoryService: JumpGroupRepositoryService;
    let handler: RetrieveJumpGroupByIdQueryHandler;

    beforeEach(() => {
        jumpGroupRepositoryService = mockJumpGroupRepositoryService();
        handler = new RetrieveJumpGroupByIdQueryHandler(jumpGroupRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(jumpGroupRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(handler.execute(new RetrieveJumpGroupByIdQuery('transaction-1', 1, 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return value from the repo', async () => {
            const expectedJumpGroup = { id: 123 } as JumpGroupEntity;
            const jumpGroupRepositoryServiceFindOneByIdMethod = jest
                .spyOn(jumpGroupRepositoryService, 'findOneById')
                .mockResolvedValue(expectedJumpGroup);

            const result = await handler.execute(new RetrieveJumpGroupByIdQuery('transaction-1', 1, 123));

            expect(result).toBe(expectedJumpGroup);
            expect(jumpGroupRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(1, 123);
        });
    });
});

function mockJumpGroupRepositoryService() {
    const service = {} as JumpGroupRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
