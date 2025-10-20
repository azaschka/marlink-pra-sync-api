import { GroupPolicyRepositoryService } from '../repositories/services/group-policy-repository.service';
import { GroupPolicyService } from './group-policy.service';

describe('GroupPolicyService', () => {
    let service: GroupPolicyService;
    let groupPolicyRepositoryService: GroupPolicyRepositoryService;

    beforeEach(() => {
        groupPolicyRepositoryService = mockRepositoryService();
        service = new GroupPolicyService(groupPolicyRepositoryService);
    });

    describe('createOrUpdateById', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' };
            const repositoryCreateOrUpdateByIdMethod = jest
                .spyOn(groupPolicyRepositoryService, 'createOrUpdateById')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(repositoryCreateOrUpdateByIdMethod).toHaveBeenCalledWith(123, entity);
        });
    });

    describe('deleteById', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(groupPolicyRepositoryService, 'deleteById')
                .mockReturnValue(Promise.resolve());

            await service.deleteById(123, 1);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1);
        });
    });
});

function mockRepositoryService(): GroupPolicyRepositoryService {
    const repositoryService = {} as GroupPolicyRepositoryService;

    repositoryService.createOrUpdateById = jest.fn();
    repositoryService.deleteById = jest.fn();

    return repositoryService;
}
