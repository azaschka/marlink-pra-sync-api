import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../../shared/utilities';
import { RemoteRdp } from '../../models';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { MarkRemoteRdpAsSyncedCommand } from '../mark-remote-rdp-as-synced.command';
import { MarkRemoteRdpAsSyncedCommandHandler } from './mark-remote-rdp-as-synced.command-handler';

describe('MarkRemoteRdpAsSyncedCommandHandler', () => {
    let remoteRdpRepositoryService: RemoteRdpRepositoryService;
    let handler: MarkRemoteRdpAsSyncedCommandHandler;

    beforeEach(() => {
        remoteRdpRepositoryService = mockRemoteRdpRepositoryService();
        handler = new MarkRemoteRdpAsSyncedCommandHandler(remoteRdpRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(remoteRdpRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkRemoteRdpAsSyncedCommand('transaction-1', 1, 2))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(remoteRdpRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkRemoteRdpAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockRemoteRdpRepositoryService(): RemoteRdpRepositoryService {
    const service = {} as RemoteRdpRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as RemoteRdp));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
