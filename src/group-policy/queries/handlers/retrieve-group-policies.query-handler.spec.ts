import { Like } from 'typeorm';
import { GroupPolicyEntity } from '../../repositories/entities';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { RetrieveGroupPoliciesQuery } from '../retrieve-group-policies.query';
import { RetrieveGroupPoliciesQueryHandler } from './retrieve-group-policies.query-handler';

describe('RetrieveGroupPoliciesQueryHandler', () => {
    let groupPolicyRepositoryService: GroupPolicyRepositoryService;
    let handler: RetrieveGroupPoliciesQueryHandler;

    beforeEach(() => {
        groupPolicyRepositoryService = mockGroupPolicyRepositoryService();
        handler = new RetrieveGroupPoliciesQueryHandler(groupPolicyRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedGroupPolicies = [] as GroupPolicyEntity[];
            const groupPolicyRepositoryServiceFindByMethod = jest
                .spyOn(groupPolicyRepositoryService, 'findBy')
                .mockResolvedValue(expectedGroupPolicies);

            const result = await handler.execute(new RetrieveGroupPoliciesQuery('transaction-1', 123, 20, 2));

            expect(result).toBe(expectedGroupPolicies);
            expect(groupPolicyRepositoryServiceFindByMethod).toHaveBeenCalledWith(123, [{}], 2, 20);
        });

        it.each([
            {
                query: new RetrieveGroupPoliciesQuery('transaction-2', 123, 10, 1, 'group-policy-1'),
                expectedFindByQuery: [{ name: 'group-policy-1' }],
            },
            {
                query: new RetrieveGroupPoliciesQuery('transaction-2', 123, 10, 1, undefined, ['group-policy%']),
                expectedFindByQuery: [{ name: Like('group-policy%') }],
            },
        ])(
            'should call the repo with correct parameter and return value from the repo',
            async ({ query, expectedFindByQuery }) => {
                const expectedGroupPolicies = [] as GroupPolicyEntity[];
                const groupPolicyRepositoryServiceFindByMethod = jest
                    .spyOn(groupPolicyRepositoryService, 'findBy')
                    .mockResolvedValue(expectedGroupPolicies);

                const result = await handler.execute(query);

                expect(result).toBe(expectedGroupPolicies);
                expect(groupPolicyRepositoryServiceFindByMethod).toHaveBeenCalledWith(123, expectedFindByQuery, 1, 10);
            },
        );
    });
});

function mockGroupPolicyRepositoryService() {
    const service = {} as GroupPolicyRepositoryService;
    service.findBy = jest.fn();

    return service;
}
