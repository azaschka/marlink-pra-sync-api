import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { JumpGroup } from '../../models';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { MarkJumpGroupAsSyncedCommand } from '../mark-jump-group-as-synced.command';
import { MarkJumpGroupAsSyncedCommandHandler } from './mark-jump-group-as-synced.command-handler';

describe('MarkJumpGroupAsSyncedCommandHandler', () => {
    let jumpGroupRepositoryService: JumpGroupRepositoryService;
    let handler: MarkJumpGroupAsSyncedCommandHandler;

    beforeEach(() => {
        jumpGroupRepositoryService = mockJumpGroupRepositoryService();
        handler = new MarkJumpGroupAsSyncedCommandHandler(jumpGroupRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(jumpGroupRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkJumpGroupAsSyncedCommand('transaction-1', 1, 2))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(jumpGroupRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkJumpGroupAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockJumpGroupRepositoryService(): JumpGroupRepositoryService {
    const service = {} as JumpGroupRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as JumpGroup));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
