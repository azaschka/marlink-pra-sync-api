import { JumpClientInstallerRepositoryService } from '../repositories/services/jump-client-installer-repository.service';
import { JumpClientInstallerService } from './jump-client-installer.service';

describe('JumpClientInstallerService', () => {
    let service: JumpClientInstallerService;
    let jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService;

    beforeEach(() => {
        jumpClientInstallerRepositoryService = mockRepositoryService();
        service = new JumpClientInstallerService(jumpClientInstallerRepositoryService);
    });

    describe('createOrUpdateById', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' };
            const repositoryCreateOrUpdateByIdMethod = jest
                .spyOn(jumpClientInstallerRepositoryService, 'createOrUpdateById')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(repositoryCreateOrUpdateByIdMethod).toHaveBeenCalledWith(123, entity);
        });
    });

    describe('deleteById', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(jumpClientInstallerRepositoryService, 'deleteById')
                .mockReturnValue(Promise.resolve());

            await service.deleteById(123, 1);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1);
        });
    });
});

function mockRepositoryService(): JumpClientInstallerRepositoryService {
    const repositoryService = {} as JumpClientInstallerRepositoryService;

    repositoryService.createOrUpdateById = jest.fn();
    repositoryService.deleteById = jest.fn();

    return repositoryService;
}
