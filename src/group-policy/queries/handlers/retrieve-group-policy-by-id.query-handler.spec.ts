import { NotFoundException } from '@nestjs/common';
import { GroupPolicyEntity } from '../../repositories/entities';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { RetrieveGroupPolicyByIdQuery } from '../retrieve-group-policy-by-id.query';
import { RetrieveGroupPolicyByIdQueryHandler } from './retrieve-group-policy-by-id.query-handler';

describe('RetrieveGroupPolicyByIdQueryHandler', () => {
    let groupPolicyRepositoryService: GroupPolicyRepositoryService;
    let handler: RetrieveGroupPolicyByIdQueryHandler;

    beforeEach(() => {
        groupPolicyRepositoryService = mockGroupPolicyRepositoryService();
        handler = new RetrieveGroupPolicyByIdQueryHandler(groupPolicyRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(groupPolicyRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(handler.execute(new RetrieveGroupPolicyByIdQuery('transaction-1', 1, 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return value from the repo', async () => {
            const expectedGroupPolicy = { id: 123 } as GroupPolicyEntity;
            const groupPolicyRepositoryServiceFindOneByIdMethod = jest
                .spyOn(groupPolicyRepositoryService, 'findOneById')
                .mockResolvedValue(expectedGroupPolicy);

            const result = await handler.execute(new RetrieveGroupPolicyByIdQuery('transaction-1', 1, 123));

            expect(result).toBe(expectedGroupPolicy);
            expect(groupPolicyRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(1, 123);
        });
    });
});

function mockGroupPolicyRepositoryService() {
    const service = {} as GroupPolicyRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
