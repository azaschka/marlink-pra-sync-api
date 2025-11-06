import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../../shared/utilities';
import { RemoteVnc } from '../../models';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { MarkRemoteVncAsSyncedCommand } from '../mark-remote-vnc-as-synced.command';
import { MarkRemoteVncAsSyncedCommandHandler } from './mark-remote-vnc-as-synced.command-handler';

describe('MarkRemoteVncAsSyncedCommandHandler', () => {
    let remoteVncRepositoryService: RemoteVncRepositoryService;
    let handler: MarkRemoteVncAsSyncedCommandHandler;

    beforeEach(() => {
        remoteVncRepositoryService = mockRemoteVncRepositoryService();
        handler = new MarkRemoteVncAsSyncedCommandHandler(remoteVncRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(remoteVncRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkRemoteVncAsSyncedCommand('transaction-1', 1, 2))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(remoteVncRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkRemoteVncAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockRemoteVncRepositoryService(): RemoteVncRepositoryService {
    const service = {} as RemoteVncRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as RemoteVnc));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
