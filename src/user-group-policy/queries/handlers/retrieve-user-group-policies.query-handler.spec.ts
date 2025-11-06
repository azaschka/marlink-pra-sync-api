import { UserGroupPolicyEntity } from '../../repositories/entities';
import { UserGroupPolicyRepositoryService } from '../../repositories/services/user-group-policy-repository.service';
import { RetrieveUserGroupPoliciesQuery } from '../retrieve-user-group-policies.query';
import { RetrieveUserGroupPoliciesQueryHandler } from './retrieve-user-group-policies.query-handler';

describe('RetrieveUserGroupPoliciesQueryHandler', () => {
    let userGroupPolicyRepositoryService: UserGroupPolicyRepositoryService;
    let handler: RetrieveUserGroupPoliciesQueryHandler;

    beforeEach(() => {
        userGroupPolicyRepositoryService = mockUserGroupPolicyRepositoryService();
        handler = new RetrieveUserGroupPoliciesQueryHandler(userGroupPolicyRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedUserGroupPolicyEntities = [
                {
                    userId: 123,
                    groupPolicyId: 1,
                    groupPolicy: {
                        id: 1,
                        name: 'Policy 1',
                    },
                },
                {
                    userId: 123,
                    groupPolicyId: 2,
                    groupPolicy: {
                        id: 2,
                        name: 'Policy 2',
                    },
                },
            ] as UserGroupPolicyEntity[];
            const userGroupPolicyRepositoryServiceFindByMethod = jest
                .spyOn(userGroupPolicyRepositoryService, 'findBy')
                .mockResolvedValue(expectedUserGroupPolicyEntities);

            const result = await handler.execute(new RetrieveUserGroupPoliciesQuery('transaction-2', 100, 10, 1, 123));

            expect(result).toBe(expectedUserGroupPolicyEntities);
            expect(userGroupPolicyRepositoryServiceFindByMethod).toHaveBeenCalledWith(100, { userId: 123 }, 1, 10);
        });
    });
});

function mockUserGroupPolicyRepositoryService() {
    const service = {} as UserGroupPolicyRepositoryService;
    service.findBy = jest.fn();

    return service;
}
