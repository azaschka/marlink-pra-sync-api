import { UserGroupPolicyEntity } from '../repositories/entities';
import { UserGroupPolicyRepositoryService } from '../repositories/services/user-group-policy-repository.service';
import { UserGroupPolicyService } from './user-group-policy.service';

describe('UserGroupPolicyService', () => {
    let service: UserGroupPolicyService;
    let userGroupPolicyRepositoryService: UserGroupPolicyRepositoryService;

    beforeEach(() => {
        userGroupPolicyRepositoryService = mockRepositoryService();
        service = new UserGroupPolicyService(userGroupPolicyRepositoryService);
    });

    describe('createOrUpdateByUserIdAndGroupPolicyId', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' } as Partial<UserGroupPolicyEntity>;
            const repositoryCreateOrUpdateMethod = jest
                .spyOn(userGroupPolicyRepositoryService, 'createOrUpdateByUserIdAndGroupPolicyId')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateByUserIdAndGroupPolicyId(123, entity);

            expect(repositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, [entity]);
        });
    });

    describe('deleteByUserIdAndGroupPolicyId', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(userGroupPolicyRepositoryService, 'deleteByUserIdAndGroupPolicyId')
                .mockReturnValue(Promise.resolve());

            await service.deleteByUserIdAndGroupPolicyId(123, 1, 2);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1, 2);
        });
    });
});

function mockRepositoryService(): UserGroupPolicyRepositoryService {
    const repositoryService = {} as UserGroupPolicyRepositoryService;

    repositoryService.createOrUpdateByUserIdAndGroupPolicyId = jest.fn();
    repositoryService.deleteByUserIdAndGroupPolicyId = jest.fn();

    return repositoryService;
}
