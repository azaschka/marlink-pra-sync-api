import { WebJumpRepositoryService } from '../repositories/services/web-jump-repository.service';
import { WebJumpService } from './web-jump.service';

describe('WebJumpService', () => {
    let service: WebJumpService;
    let webJumpRepositoryService: WebJumpRepositoryService;

    beforeEach(() => {
        webJumpRepositoryService = mockRepositoryService();
        service = new WebJumpService(webJumpRepositoryService);
    });

    describe('createOrUpdateById', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' };
            const repositoryCreateOrUpdateByIdMethod = jest
                .spyOn(webJumpRepositoryService, 'createOrUpdateById')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(repositoryCreateOrUpdateByIdMethod).toHaveBeenCalledWith(123, entity);
        });
    });

    describe('deleteById', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(webJumpRepositoryService, 'deleteById')
                .mockReturnValue(Promise.resolve());

            await service.deleteById(123, 1);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1);
        });
    });
});

function mockRepositoryService(): WebJumpRepositoryService {
    const repositoryService = {} as WebJumpRepositoryService;

    repositoryService.createOrUpdateById = jest.fn();
    repositoryService.deleteById = jest.fn();

    return repositoryService;
}
