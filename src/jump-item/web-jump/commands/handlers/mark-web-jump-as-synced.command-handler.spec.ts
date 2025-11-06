import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../../shared/utilities';
import { WebJump } from '../../models';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { MarkWebJumpAsSyncedCommand } from '../mark-web-jump-as-synced.command';
import { MarkWebJumpAsSyncedCommandHandler } from './mark-web-jump-as-synced.command-handler';

describe('MarkWebJumpAsSyncedCommandHandler', () => {
    let webJumpRepositoryService: WebJumpRepositoryService;
    let handler: MarkWebJumpAsSyncedCommandHandler;

    beforeEach(() => {
        webJumpRepositoryService = mockWebJumpRepositoryService();
        handler = new MarkWebJumpAsSyncedCommandHandler(webJumpRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(webJumpRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkWebJumpAsSyncedCommand('transaction-1', 1, 2))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(webJumpRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkWebJumpAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockWebJumpRepositoryService(): WebJumpRepositoryService {
    const service = {} as WebJumpRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as WebJump));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
