import { JumpPolicyRepositoryService } from '../repositories/services/jump-policy-repository.service';
import { JumpPolicyService } from './jump-policy.service';

describe('JumpPolicyService', () => {
    let service: JumpPolicyService;
    let jumpPolicyRepositoryService: JumpPolicyRepositoryService;

    beforeEach(() => {
        jumpPolicyRepositoryService = mockRepositoryService();
        service = new JumpPolicyService(jumpPolicyRepositoryService);
    });

    describe('createOrUpdateById', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' };
            const repositoryCreateOrUpdateByIdMethod = jest
                .spyOn(jumpPolicyRepositoryService, 'createOrUpdateById')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(repositoryCreateOrUpdateByIdMethod).toHaveBeenCalledWith(123, entity);
        });
    });

    describe('deleteById', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(jumpPolicyRepositoryService, 'deleteById')
                .mockReturnValue(Promise.resolve());

            await service.deleteById(123, 1);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1);
        });
    });
});

function mockRepositoryService(): JumpPolicyRepositoryService {
    const repositoryService = {} as JumpPolicyRepositoryService;

    repositoryService.createOrUpdateById = jest.fn();
    repositoryService.deleteById = jest.fn();

    return repositoryService;
}
