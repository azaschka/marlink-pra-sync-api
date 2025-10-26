import { GroupPolicyJumpointEntity } from '../repositories/entities';
import { GroupPolicyJumpointRepositoryService } from '../repositories/services/group-policy-jumpoint-repository.service';
import { GroupPolicyJumpointService } from './group-policy-jumpoint.service';

describe('GroupPolicyJumpointService', () => {
    let service: GroupPolicyJumpointService;
    let groupPolicyJumpointRepositoryService: GroupPolicyJumpointRepositoryService;

    beforeEach(() => {
        groupPolicyJumpointRepositoryService = mockRepositoryService();
        service = new GroupPolicyJumpointService(groupPolicyJumpointRepositoryService);
    });

    describe('createOrUpdateByGroupPolicyIdAndJumpointId', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' } as Partial<GroupPolicyJumpointEntity>;
            const repositoryCreateOrUpdateMethod = jest
                .spyOn(groupPolicyJumpointRepositoryService, 'createOrUpdateByGroupPolicyIdAndJumpointId')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateByGroupPolicyIdAndJumpointId(123, entity);

            expect(repositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, [entity]);
        });
    });

    describe('deleteByGroupPolicyIdAndJumpointId', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(groupPolicyJumpointRepositoryService, 'deleteByGroupPolicyIdAndJumpointId')
                .mockReturnValue(Promise.resolve());

            await service.deleteByGroupPolicyIdAndJumpointId(123, 1, 2);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1, 2);
        });
    });
});

function mockRepositoryService(): GroupPolicyJumpointRepositoryService {
    const repositoryService = {} as GroupPolicyJumpointRepositoryService;

    repositoryService.createOrUpdateByGroupPolicyIdAndJumpointId = jest.fn();
    repositoryService.deleteByGroupPolicyIdAndJumpointId = jest.fn();

    return repositoryService;
}
