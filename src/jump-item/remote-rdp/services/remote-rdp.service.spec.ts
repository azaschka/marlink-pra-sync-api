import { RemoteRdpRepositoryService } from '../repositories/services/remote-rdp-repository.service';
import { RemoteRdpService } from './remote-rdp.service';

describe('RemoteRdpService', () => {
    let service: RemoteRdpService;
    let remoteRdpRepositoryService: RemoteRdpRepositoryService;

    beforeEach(() => {
        remoteRdpRepositoryService = mockRepositoryService();
        service = new RemoteRdpService(remoteRdpRepositoryService);
    });

    describe('createOrUpdateById', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' };
            const repositoryCreateOrUpdateByIdMethod = jest
                .spyOn(remoteRdpRepositoryService, 'createOrUpdateById')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(repositoryCreateOrUpdateByIdMethod).toHaveBeenCalledWith(123, entity);
        });
    });

    describe('deleteById', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(remoteRdpRepositoryService, 'deleteById')
                .mockReturnValue(Promise.resolve());

            await service.deleteById(123, 1);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1);
        });
    });
});

function mockRepositoryService(): RemoteRdpRepositoryService {
    const repositoryService = {} as RemoteRdpRepositoryService;

    repositoryService.createOrUpdateById = jest.fn();
    repositoryService.deleteById = jest.fn();

    return repositoryService;
}
