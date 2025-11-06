import { GroupPolicyMemberEntity } from '../../repositories/entities';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { RetrieveGroupPolicyMembersQuery } from '../retrieve-group-policy-members.query';
import { RetrieveGroupPolicyMembersQueryHandler } from './retrieve-group-policy-members.query-handler';

describe('RetrieveGroupPolicyMembersQueryHandler', () => {
    let groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService;
    let handler: RetrieveGroupPolicyMembersQueryHandler;

    beforeEach(() => {
        groupPolicyMemberRepositoryService = mockGroupPolicyMemberRepositoryService();
        handler = new RetrieveGroupPolicyMembersQueryHandler(groupPolicyMemberRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedGroupPolicyMemberEntities = [
                {
                    groupPolicyId: 123,
                    memberId: 1,
                    user: {
                        id: 1,
                        publicDisplayName: 'User 1',
                    },
                },
                {
                    groupPolicyId: 123,
                    memberId: 2,
                    user: {
                        id: 2,
                        publicDisplayName: 'User 2',
                    },
                },
            ] as GroupPolicyMemberEntity[];
            const groupPolicyMemberRepositoryServiceFindByMethod = jest
                .spyOn(groupPolicyMemberRepositoryService, 'findBy')
                .mockResolvedValue(expectedGroupPolicyMemberEntities);

            const result = await handler.execute(new RetrieveGroupPolicyMembersQuery('transaction-2', 100, 10, 1, 123));

            expect(result).toBe(expectedGroupPolicyMemberEntities);
            expect(groupPolicyMemberRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                100,
                { groupPolicyId: 123 },
                1,
                10,
            );
        });
    });
});

function mockGroupPolicyMemberRepositoryService() {
    const service = {} as GroupPolicyMemberRepositoryService;
    service.findBy = jest.fn();

    return service;
}
