import { NotFoundException } from '@nestjs/common';
import { JumpPolicyEntity } from '../../repositories/entities';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { RetrieveJumpPolicyByIdQuery } from '../retrieve-jump-policy-by-id.query';
import { RetrieveJumpPolicyByIdQueryHandler } from './retrieve-jump-policy-by-id.query-handler';

describe('RetrieveJumpPolicyByIdQueryHandler', () => {
    let jumpPolicyRepositoryService: JumpPolicyRepositoryService;
    let handler: RetrieveJumpPolicyByIdQueryHandler;

    beforeEach(() => {
        jumpPolicyRepositoryService = mockJumpPolicyRepositoryService();
        handler = new RetrieveJumpPolicyByIdQueryHandler(jumpPolicyRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(jumpPolicyRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(handler.execute(new RetrieveJumpPolicyByIdQuery('transaction-1', 1, 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return value from the repo', async () => {
            const expectedJumpPolicy = { id: 123 } as JumpPolicyEntity;
            const jumpPolicyRepositoryServiceFindOneByIdMethod = jest
                .spyOn(jumpPolicyRepositoryService, 'findOneById')
                .mockResolvedValue(expectedJumpPolicy);

            const result = await handler.execute(new RetrieveJumpPolicyByIdQuery('transaction-1', 1, 123));

            expect(result).toBe(expectedJumpPolicy);
            expect(jumpPolicyRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(1, 123);
        });
    });
});

function mockJumpPolicyRepositoryService() {
    const service = {} as JumpPolicyRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
