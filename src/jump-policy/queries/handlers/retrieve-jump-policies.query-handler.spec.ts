import { JumpPolicyEntity } from '../../repositories/entities';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { RetrieveJumpPoliciesQuery } from '../retrieve-jump-policies.query';
import { RetrieveJumpPoliciesQueryHandler } from './retrieve-jump-policies.query-handler';

describe('RetrieveJumpPoliciesQueryHandler', () => {
    let jumpPolicyRepositoryService: JumpPolicyRepositoryService;
    let handler: RetrieveJumpPoliciesQueryHandler;

    beforeEach(() => {
        jumpPolicyRepositoryService = mockJumpPolicyRepositoryService();
        handler = new RetrieveJumpPoliciesQueryHandler(jumpPolicyRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedJumpPolicies = [] as JumpPolicyEntity[];
            const jumpPolicyRepositoryServiceFindByMethod = jest
                .spyOn(jumpPolicyRepositoryService, 'findBy')
                .mockResolvedValue(expectedJumpPolicies);

            const result = await handler.execute(new RetrieveJumpPoliciesQuery('transaction-1', 20, 2));

            expect(result).toBe(expectedJumpPolicies);
            expect(jumpPolicyRepositoryServiceFindByMethod).toHaveBeenCalledWith({}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedJumpPolicies = [] as JumpPolicyEntity[];
            const jumpPolicyRepositoryServiceFindByMethod = jest
                .spyOn(jumpPolicyRepositoryService, 'findBy')
                .mockResolvedValue(expectedJumpPolicies);

            const result = await handler.execute(
                new RetrieveJumpPoliciesQuery('transaction-2', 10, 1, 'jump-policy-1'),
            );

            expect(result).toBe(expectedJumpPolicies);
            expect(jumpPolicyRepositoryServiceFindByMethod).toHaveBeenCalledWith({ codeName: 'jump-policy-1' }, 1, 10);
        });
    });
});

function mockJumpPolicyRepositoryService() {
    const service = {} as JumpPolicyRepositoryService;
    service.findBy = jest.fn();

    return service;
}
