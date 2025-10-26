import { GroupPolicyMemberEntity } from '../repositories/entities';
import { GroupPolicyMemberRepositoryService } from '../repositories/services/group-policy-member-repository.service';
import { GroupPolicyMemberService } from './group-policy-member.service';

describe('GroupPolicyMemberService', () => {
    let service: GroupPolicyMemberService;
    let groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService;

    beforeEach(() => {
        groupPolicyMemberRepositoryService = mockRepositoryService();
        service = new GroupPolicyMemberService(groupPolicyMemberRepositoryService);
    });

    describe('createOrUpdateByGroupPolicyIdAndMemberId', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' } as Partial<GroupPolicyMemberEntity>;
            const repositoryCreateOrUpdateMethod = jest
                .spyOn(groupPolicyMemberRepositoryService, 'createOrUpdateByGroupPolicyIdAndMemberId')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateByGroupPolicyIdAndMemberId(123, entity);

            expect(repositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, [entity]);
        });
    });

    describe('deleteByGroupPolicyIdAndMemberId', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(groupPolicyMemberRepositoryService, 'deleteByGroupPolicyIdAndMemberId')
                .mockReturnValue(Promise.resolve());

            await service.deleteByGroupPolicyIdAndMemberId(123, 1, 2);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1, 2);
        });
    });
});

function mockRepositoryService(): GroupPolicyMemberRepositoryService {
    const repositoryService = {} as GroupPolicyMemberRepositoryService;

    repositoryService.createOrUpdateByGroupPolicyIdAndMemberId = jest.fn();
    repositoryService.deleteByGroupPolicyIdAndMemberId = jest.fn();

    return repositoryService;
}
