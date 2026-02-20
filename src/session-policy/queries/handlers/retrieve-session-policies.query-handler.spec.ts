import { SessionPolicyEntity } from '../../repositories/entities';
import { SessionPolicyRepositoryService } from '../../repositories/services/session-policy-repository.service';
import { RetrieveSessionPoliciesQuery } from '../retrieve-session-policies.query';
import { RetrieveSessionPoliciesQueryHandler } from './retrieve-session-policies.query-handler';

describe('RetrieveSessionPoliciesQueryHandler', () => {
    let sessionPolicyRepositoryService: SessionPolicyRepositoryService;
    let handler: RetrieveSessionPoliciesQueryHandler;

    beforeEach(() => {
        sessionPolicyRepositoryService = mockSessionPolicyRepositoryService();
        handler = new RetrieveSessionPoliciesQueryHandler(sessionPolicyRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedSessionPolicies = [] as SessionPolicyEntity[];
            const sessionPolicyRepositoryServiceFindByMethod = jest
                .spyOn(sessionPolicyRepositoryService, 'findBy')
                .mockResolvedValue(expectedSessionPolicies);

            const result = await handler.execute(new RetrieveSessionPoliciesQuery('transaction-1', 123, 20, 2));

            expect(result).toBe(expectedSessionPolicies);
            expect(sessionPolicyRepositoryServiceFindByMethod).toHaveBeenCalledWith(123, [{}], 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedSessionPolicies = [] as SessionPolicyEntity[];
            const sessionPolicyRepositoryServiceFindByMethod = jest
                .spyOn(sessionPolicyRepositoryService, 'findBy')
                .mockResolvedValue(expectedSessionPolicies);

            const result = await handler.execute(
                new RetrieveSessionPoliciesQuery('transaction-2', 123, 10, 1, 'session-policy-1', 'session-code-1'),
            );

            expect(result).toBe(expectedSessionPolicies);
            expect(sessionPolicyRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                123,
                [{ displayName: 'session-policy-1', codeName: 'session-code-1' }],
                1,
                10,
            );
        });
    });
});

function mockSessionPolicyRepositoryService() {
    const service = {} as SessionPolicyRepositoryService;
    service.findBy = jest.fn();

    return service;
}
