import { NotFoundException } from '@nestjs/common';
import { JumpointNodeEntity } from '../../repositories/entities';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { RetrieveJumpointNodeByIdQuery } from '../retrieve-jumpoint-node-by-id.query';
import { RetrieveJumpointNodeByIdQueryHandler } from './retrieve-jumpoint-node-by-id.query-handler';

describe('RetrieveJumpointNodeByIdQueryHandler', () => {
    let jumpointRepositoryService: JumpointNodeRepositoryService;
    let handler: RetrieveJumpointNodeByIdQueryHandler;

    beforeEach(() => {
        jumpointRepositoryService = mockJumpointNodeRepositoryService();
        handler = new RetrieveJumpointNodeByIdQueryHandler(jumpointRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(jumpointRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(handler.execute(new RetrieveJumpointNodeByIdQuery('transaction-1', 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return value from the repo', async () => {
            const expectedJumpointNode = { id: 123 } as JumpointNodeEntity;
            const jumpointRepositoryServiceFindOneByIdMethod = jest
                .spyOn(jumpointRepositoryService, 'findOneById')
                .mockResolvedValue(expectedJumpointNode);

            const result = await handler.execute(new RetrieveJumpointNodeByIdQuery('transaction-1', 123));

            expect(result).toBe(expectedJumpointNode);
            expect(jumpointRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(123);
        });
    });
});

function mockJumpointNodeRepositoryService() {
    const service = {} as JumpointNodeRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
