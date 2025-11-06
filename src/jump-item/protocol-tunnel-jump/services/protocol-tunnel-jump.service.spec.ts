import { ProtocolTunnelJumpRepositoryService } from '../repositories/services/protocol-tunnel-jump-repository.service';
import { ProtocolTunnelJumpService } from './protocol-tunnel-jump.service';

describe('ProtocolTunnelJumpService', () => {
    let service: ProtocolTunnelJumpService;
    let protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService;

    beforeEach(() => {
        protocolTunnelJumpRepositoryService = mockRepositoryService();
        service = new ProtocolTunnelJumpService(protocolTunnelJumpRepositoryService);
    });

    describe('createOrUpdateById', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' };
            const repositoryCreateOrUpdateByIdMethod = jest
                .spyOn(protocolTunnelJumpRepositoryService, 'createOrUpdateById')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(repositoryCreateOrUpdateByIdMethod).toHaveBeenCalledWith(123, entity);
        });
    });

    describe('deleteById', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(protocolTunnelJumpRepositoryService, 'deleteById')
                .mockReturnValue(Promise.resolve());

            await service.deleteById(123, 1);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1);
        });
    });
});

function mockRepositoryService(): ProtocolTunnelJumpRepositoryService {
    const repositoryService = {} as ProtocolTunnelJumpRepositoryService;

    repositoryService.createOrUpdateById = jest.fn();
    repositoryService.deleteById = jest.fn();

    return repositoryService;
}
