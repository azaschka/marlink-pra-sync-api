import { NotFoundException } from '@nestjs/common';
import { RemoteVncEntity } from '../../repositories/entities';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { RetrieveRemoteVncByIdQuery } from '../retrieve-remote-vnc-by-id.query';
import { RetrieveRemoteVncByIdQueryHandler } from './retrieve-remote-vnc-by-id.query-handler';

describe('RetrieveRemoteVncByIdQueryHandler', () => {
    let remoteVncRepositoryService: RemoteVncRepositoryService;
    let handler: RetrieveRemoteVncByIdQueryHandler;

    beforeEach(() => {
        remoteVncRepositoryService = mockRemoteVncRepositoryService();
        handler = new RetrieveRemoteVncByIdQueryHandler(remoteVncRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(remoteVncRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(handler.execute(new RetrieveRemoteVncByIdQuery('transaction-1', 1, 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return value from the repo', async () => {
            const expectedRemoteVnc = { id: 123 } as RemoteVncEntity;
            const remoteVncRepositoryServiceFindOneByIdMethod = jest
                .spyOn(remoteVncRepositoryService, 'findOneById')
                .mockResolvedValue(expectedRemoteVnc);

            const result = await handler.execute(new RetrieveRemoteVncByIdQuery('transaction-1', 1, 123));

            expect(result).toBe(expectedRemoteVnc);
            expect(remoteVncRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(1, 123);
        });
    });
});

function mockRemoteVncRepositoryService() {
    const service = {} as RemoteVncRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
