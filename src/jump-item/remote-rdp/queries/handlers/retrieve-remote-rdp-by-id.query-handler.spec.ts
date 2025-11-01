import { NotFoundException } from '@nestjs/common';
import { RemoteRdpEntity } from '../../repositories/entities';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { RetrieveRemoteRdpByIdQuery } from '../retrieve-remote-rdp-by-id.query';
import { RetrieveRemoteRdpByIdQueryHandler } from './retrieve-remote-rdp-by-id.query-handler';

describe('RetrieveRemoteRdpByIdQueryHandler', () => {
    let remoteRdpRepositoryService: RemoteRdpRepositoryService;
    let handler: RetrieveRemoteRdpByIdQueryHandler;

    beforeEach(() => {
        remoteRdpRepositoryService = mockRemoteRdpRepositoryService();
        handler = new RetrieveRemoteRdpByIdQueryHandler(remoteRdpRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(remoteRdpRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(handler.execute(new RetrieveRemoteRdpByIdQuery('transaction-1', 1, 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return value from the repo', async () => {
            const expectedRemoteRdp = { id: 123 } as RemoteRdpEntity;
            const remoteRdpRepositoryServiceFindOneByIdMethod = jest
                .spyOn(remoteRdpRepositoryService, 'findOneById')
                .mockResolvedValue(expectedRemoteRdp);

            const result = await handler.execute(new RetrieveRemoteRdpByIdQuery('transaction-1', 1, 123));

            expect(result).toBe(expectedRemoteRdp);
            expect(remoteRdpRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(1, 123);
        });
    });
});

function mockRemoteRdpRepositoryService() {
    const service = {} as RemoteRdpRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
