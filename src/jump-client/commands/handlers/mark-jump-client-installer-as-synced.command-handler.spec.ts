import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { JumpClientInstaller } from '../../models';
import { JumpClientInstallerRepositoryService } from '../../repositories/services/jump-client-installer-repository.service';
import { MarkJumpClientInstallerAsSyncedCommand } from '../mark-jump-client-installer-as-synced.command';
import { MarkJumpClientInstallerAsSyncedCommandHandler } from './mark-jump-client-installer-as-synced.command-handler';

describe('MarkJumpClientInstallerAsSyncedCommandHandler', () => {
    let jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService;
    let handler: MarkJumpClientInstallerAsSyncedCommandHandler;

    beforeEach(() => {
        jumpClientInstallerRepositoryService = mockJumpClientInstallerRepositoryService();
        handler = new MarkJumpClientInstallerAsSyncedCommandHandler(jumpClientInstallerRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(jumpClientInstallerRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(
            handler.execute(new MarkJumpClientInstallerAsSyncedCommand('transaction-1', 1, 2)),
        ).rejects.toThrow(NotFoundException);
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(jumpClientInstallerRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkJumpClientInstallerAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockJumpClientInstallerRepositoryService(): JumpClientInstallerRepositoryService {
    const service = {} as JumpClientInstallerRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as JumpClientInstaller));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
