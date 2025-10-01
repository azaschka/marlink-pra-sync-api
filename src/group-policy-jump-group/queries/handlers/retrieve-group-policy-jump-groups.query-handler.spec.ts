import { GroupPolicyJumpGroupEntity } from '../../repositories/entities';
import { GroupPolicyJumpGroupRepositoryService } from '../../repositories/services/group-policy-jump-group-repository.service';
import { RetrieveGroupPolicyJumpGroupsQuery } from '../retrieve-group-policy-jump-groups.query';
import { RetrieveGroupPolicyJumpGroupsQueryHandler } from './retrieve-group-policy-jump-groups.query-handler';

describe('RetrieveGroupPolicyJumpGroupsQueryHandler', () => {
    let groupPolicyJumpGroupRepositoryService: GroupPolicyJumpGroupRepositoryService;
    let handler: RetrieveGroupPolicyJumpGroupsQueryHandler;

    beforeEach(() => {
        groupPolicyJumpGroupRepositoryService = mockGroupPolicyJumpGroupRepositoryService();
        handler = new RetrieveGroupPolicyJumpGroupsQueryHandler(groupPolicyJumpGroupRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedGroupPolicyJumpGroupEntities = [
                {
                    groupPolicyId: 123,
                    jumpGroupId: 1,
                    jumpGroup: {
                        id: 1,
                        name: 'Jump group 1',
                    },
                },
                {
                    groupPolicyId: 123,
                    jumpGroupId: 2,
                    jumpGroup: {
                        id: 2,
                        name: 'Jump group 2',
                    },
                },
            ] as GroupPolicyJumpGroupEntity[];
            const groupPolicyJumpGroupRepositoryServiceFindByMethod = jest
                .spyOn(groupPolicyJumpGroupRepositoryService, 'findBy')
                .mockResolvedValue(expectedGroupPolicyJumpGroupEntities);

            const result = await handler.execute(
                new RetrieveGroupPolicyJumpGroupsQuery('transaction-2', 100, 10, 1, 123),
            );

            expect(result).toBe(expectedGroupPolicyJumpGroupEntities);
            expect(groupPolicyJumpGroupRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                100,
                { groupPolicyId: 123 },
                1,
                10,
            );
        });
    });
});

function mockGroupPolicyJumpGroupRepositoryService() {
    const service = {} as GroupPolicyJumpGroupRepositoryService;
    service.findBy = jest.fn();

    return service;
}
