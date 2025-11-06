import { NotFoundException } from '@nestjs/common';
import { JumpointEntity } from '../../repositories/entities';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { RetrieveJumpointByIdQuery } from '../retrieve-jumpoint-by-id.query';
import { RetrieveJumpointByIdQueryHandler } from './retrieve-jumpoint-by-id.query-handler';

describe('RetrieveJumpointByIdQueryHandler', () => {
    let jumpointRepositoryService: JumpointRepositoryService;
    let handler: RetrieveJumpointByIdQueryHandler;

    beforeEach(() => {
        jumpointRepositoryService = mockJumpointRepositoryService();
        handler = new RetrieveJumpointByIdQueryHandler(jumpointRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(jumpointRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(handler.execute(new RetrieveJumpointByIdQuery('transaction-1', 1, 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return value from the repo', async () => {
            const expectedJumpoint = { id: 123 } as JumpointEntity;
            const jumpointRepositoryServiceFindOneByIdMethod = jest
                .spyOn(jumpointRepositoryService, 'findOneById')
                .mockResolvedValue(expectedJumpoint);

            const result = await handler.execute(new RetrieveJumpointByIdQuery('transaction-1', 1, 123));

            expect(result).toBe(expectedJumpoint);
            expect(jumpointRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(1, 123);
        });
    });
});

function mockJumpointRepositoryService() {
    const service = {} as JumpointRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
