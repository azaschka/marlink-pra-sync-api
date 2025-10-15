import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { JumpClient } from '../../models';
import { JumpClientRepositoryService } from '../../repositories/services/jump-client-repository.service';
import { MarkJumpClientAsSyncedCommand } from '../mark-jump-client-as-synced.command';
import { MarkJumpClientAsSyncedCommandHandler } from './mark-jump-client-as-synced.command-handler';

describe('MarkJumpClientAsSyncedCommandHandler', () => {
    let jumpClientRepositoryService: JumpClientRepositoryService;
    let handler: MarkJumpClientAsSyncedCommandHandler;

    beforeEach(() => {
        jumpClientRepositoryService = mockJumpClientRepositoryService();
        handler = new MarkJumpClientAsSyncedCommandHandler(jumpClientRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(jumpClientRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkJumpClientAsSyncedCommand('transaction-1', 1, 2))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(jumpClientRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkJumpClientAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockJumpClientRepositoryService(): JumpClientRepositoryService {
    const service = {} as JumpClientRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as JumpClient));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
