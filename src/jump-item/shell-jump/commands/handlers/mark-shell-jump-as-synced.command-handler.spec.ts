import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../../shared/utilities';
import { ShellJump } from '../../models';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { MarkShellJumpAsSyncedCommand } from '../mark-shell-jump-as-synced.command';
import { MarkShellJumpAsSyncedCommandHandler } from './mark-shell-jump-as-synced.command-handler';

describe('MarkShellJumpAsSyncedCommandHandler', () => {
    let shellJumpRepositoryService: ShellJumpRepositoryService;
    let handler: MarkShellJumpAsSyncedCommandHandler;

    beforeEach(() => {
        shellJumpRepositoryService = mockShellJumpRepositoryService();
        handler = new MarkShellJumpAsSyncedCommandHandler(shellJumpRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(shellJumpRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkShellJumpAsSyncedCommand('transaction-1', 1, 2))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(shellJumpRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkShellJumpAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockShellJumpRepositoryService(): ShellJumpRepositoryService {
    const service = {} as ShellJumpRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as ShellJump));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
