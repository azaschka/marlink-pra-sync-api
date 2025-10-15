import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { Jumpoint } from '../../models';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { MarkJumpointAsSyncedCommand } from '../mark-jumpoint-as-synced.command';
import { MarkJumpointAsSyncedCommandHandler } from './mark-jumpoint-as-synced.command-handler';

describe('MarkJumpointAsSyncedCommandHandler', () => {
    let jumpointRepositoryService: JumpointRepositoryService;
    let handler: MarkJumpointAsSyncedCommandHandler;

    beforeEach(() => {
        jumpointRepositoryService = mockJumpointRepositoryService();
        handler = new MarkJumpointAsSyncedCommandHandler(jumpointRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(jumpointRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkJumpointAsSyncedCommand('transaction-1', 1, 2))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(jumpointRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkJumpointAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockJumpointRepositoryService(): JumpointRepositoryService {
    const service = {} as JumpointRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as Jumpoint));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
