import { AccessPermissionStatusType as BTAccessPermissionStatusType } from '../../../beyondtrust-pra-conf-api/group-policy/enums';
import { GroupPolicy } from '../../models';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { RetrieveGroupPoliciesQuery } from '../retrieve-group-policies.query';
import { RetrieveGroupPoliciesQueryHandler } from './retrieve-group-policies.query-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTAccessPermissionStatusType: jest.fn().mockImplementation((type: BTAccessPermissionStatusType) => type),
}));

describe('RetrieveGroupPoliciesQueryHandler', () => {
    let groupPolicyRepositoryService: GroupPolicyRepositoryService;
    let handler: RetrieveGroupPoliciesQueryHandler;

    beforeEach(() => {
        groupPolicyRepositoryService = mockGroupPolicyRepositoryService();
        handler = new RetrieveGroupPoliciesQueryHandler(groupPolicyRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedGroupPolicies = [] as GroupPolicy[];
            const groupPolicyRepositoryServiceFindByMethod = jest
                .spyOn(groupPolicyRepositoryService, 'findBy')
                .mockResolvedValue(expectedGroupPolicies);

            const result = await handler.execute(new RetrieveGroupPoliciesQuery('transaction-2', 20, 2));

            expect(result).toBe(expectedGroupPolicies);
            expect(groupPolicyRepositoryServiceFindByMethod).toHaveBeenCalledWith({}, 2, 20);
        });

        it('should call the repo with page size, page number and name; and return value from the repo', async () => {
            const expectedGroupPolicies = [] as GroupPolicy[];
            const groupPolicyRepositoryServiceFindByMethod = jest
                .spyOn(groupPolicyRepositoryService, 'findBy')
                .mockResolvedValue(expectedGroupPolicies);

            const result = await handler.execute(
                new RetrieveGroupPoliciesQuery('transaction-1', 10, 1, 'group-policy-1'),
            );

            expect(result).toBe(expectedGroupPolicies);
            expect(groupPolicyRepositoryServiceFindByMethod).toHaveBeenCalledWith({ name: 'group-policy-1' }, 1, 10);
        });
    });
});

function mockGroupPolicyRepositoryService() {
    const service = {} as GroupPolicyRepositoryService;
    service.findBy = jest.fn();

    return service;
}
