import { GroupPolicyJumpGroupEntity } from '../repositories/entities';
import { GroupPolicyJumpGroupRepositoryService } from '../repositories/services/group-policy-jump-group-repository.service';
import { GroupPolicyJumpGroupService } from './group-policy-jump-group.service';

describe('GroupPolicyJumpGroupService', () => {
    let service: GroupPolicyJumpGroupService;
    let groupPolicyJumpGroupRepositoryService: GroupPolicyJumpGroupRepositoryService;

    beforeEach(() => {
        groupPolicyJumpGroupRepositoryService = mockRepositoryService();
        service = new GroupPolicyJumpGroupService(groupPolicyJumpGroupRepositoryService);
    });

    describe('createOrUpdateByGroupPolicyIdAndJumpGroupId', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' } as Partial<GroupPolicyJumpGroupEntity>;
            const repositoryCreateOrUpdateMethod = jest
                .spyOn(groupPolicyJumpGroupRepositoryService, 'createOrUpdateByGroupPolicyIdAndJumpGroupId')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateByGroupPolicyIdAndJumpGroupId(123, entity);

            expect(repositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, [entity]);
        });
    });

    describe('deleteByGroupPolicyIdAndJumpGroupId', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(groupPolicyJumpGroupRepositoryService, 'deleteByGroupPolicyIdAndJumpGroupId')
                .mockReturnValue(Promise.resolve());

            await service.deleteByGroupPolicyIdAndJumpGroupId(123, 1, 2);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1, 2);
        });
    });
});

function mockRepositoryService(): GroupPolicyJumpGroupRepositoryService {
    const repositoryService = {} as GroupPolicyJumpGroupRepositoryService;

    repositoryService.createOrUpdateByGroupPolicyIdAndJumpGroupId = jest.fn();
    repositoryService.deleteByGroupPolicyIdAndJumpGroupId = jest.fn();

    return repositoryService;
}
