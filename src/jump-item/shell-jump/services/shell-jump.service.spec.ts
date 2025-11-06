import { ShellJumpRepositoryService } from '../repositories/services/shell-jump-repository.service';
import { ShellJumpService } from './shell-jump.service';

describe('ShellJumpService', () => {
    let service: ShellJumpService;
    let shellJumpRepositoryService: ShellJumpRepositoryService;

    beforeEach(() => {
        shellJumpRepositoryService = mockRepositoryService();
        service = new ShellJumpService(shellJumpRepositoryService);
    });

    describe('createOrUpdateById', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' };
            const repositoryCreateOrUpdateByIdMethod = jest
                .spyOn(shellJumpRepositoryService, 'createOrUpdateById')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(repositoryCreateOrUpdateByIdMethod).toHaveBeenCalledWith(123, entity);
        });
    });

    describe('deleteById', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(shellJumpRepositoryService, 'deleteById')
                .mockReturnValue(Promise.resolve());

            await service.deleteById(123, 1);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1);
        });
    });
});

function mockRepositoryService(): ShellJumpRepositoryService {
    const repositoryService = {} as ShellJumpRepositoryService;

    repositoryService.createOrUpdateById = jest.fn();
    repositoryService.deleteById = jest.fn();

    return repositoryService;
}
