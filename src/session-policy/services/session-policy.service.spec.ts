import { SessionPolicyRepositoryService } from '../repositories/services/session-policy-repository.service';
import { SessionPolicyService } from './session-policy.service';

describe('SessionPolicyService', () => {
    let service: SessionPolicyService;
    let sessionPolicyRepositoryService: SessionPolicyRepositoryService;

    beforeEach(() => {
        sessionPolicyRepositoryService = mockRepositoryService();
        service = new SessionPolicyService(sessionPolicyRepositoryService);
    });

    describe('createOrUpdateById', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' };
            const repositoryCreateOrUpdateByIdMethod = jest
                .spyOn(sessionPolicyRepositoryService, 'createOrUpdateById')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(repositoryCreateOrUpdateByIdMethod).toHaveBeenCalledWith(123, entity);
        });
    });

    describe('deleteById', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(sessionPolicyRepositoryService, 'deleteById')
                .mockReturnValue(Promise.resolve());

            await service.deleteById(123, 1);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1);
        });
    });
});

function mockRepositoryService(): SessionPolicyRepositoryService {
    const repositoryService = {} as SessionPolicyRepositoryService;

    repositoryService.createOrUpdateById = jest.fn();
    repositoryService.deleteById = jest.fn();

    return repositoryService;
}
