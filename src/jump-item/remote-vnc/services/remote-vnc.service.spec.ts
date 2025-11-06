import { RemoteVncRepositoryService } from '../repositories/services/remote-vnc-repository.service';
import { RemoteVncService } from './remote-vnc.service';

describe('RemoteVncService', () => {
    let service: RemoteVncService;
    let remoteVncRepositoryService: RemoteVncRepositoryService;

    beforeEach(() => {
        remoteVncRepositoryService = mockRepositoryService();
        service = new RemoteVncService(remoteVncRepositoryService);
    });

    describe('createOrUpdateById', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' };
            const repositoryCreateOrUpdateByIdMethod = jest
                .spyOn(remoteVncRepositoryService, 'createOrUpdateById')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(repositoryCreateOrUpdateByIdMethod).toHaveBeenCalledWith(123, entity);
        });
    });

    describe('deleteById', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(remoteVncRepositoryService, 'deleteById')
                .mockReturnValue(Promise.resolve());

            await service.deleteById(123, 1);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1);
        });
    });
});

function mockRepositoryService(): RemoteVncRepositoryService {
    const repositoryService = {} as RemoteVncRepositoryService;

    repositoryService.createOrUpdateById = jest.fn();
    repositoryService.deleteById = jest.fn();

    return repositoryService;
}
