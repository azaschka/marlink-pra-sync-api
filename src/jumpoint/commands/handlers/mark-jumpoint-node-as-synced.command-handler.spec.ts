import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { JumpointNode } from '../../models';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { MarkJumpointNodeAsSyncedCommand } from '../mark-jumpoint-node-as-synced.command';
import { MarkJumpointNodeAsSyncedCommandHandler } from './mark-jumpoint-node-as-synced.command-handler';

describe('MarkJumpointNodeAsSyncedCommandHandler', () => {
    let jumpointNodeRepositoryService: JumpointNodeRepositoryService;
    let handler: MarkJumpointNodeAsSyncedCommandHandler;

    beforeEach(() => {
        jumpointNodeRepositoryService = mockJumpointNodeRepositoryService();
        handler = new MarkJumpointNodeAsSyncedCommandHandler(jumpointNodeRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(jumpointNodeRepositoryService, 'findOneBy').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkJumpointNodeAsSyncedCommand('transaction-1', 1, 2, 3))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateMethod = jest.spyOn(jumpointNodeRepositoryService, 'createOrUpdateByIdAndJumpointId');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkJumpointNodeAsSyncedCommand('transaction-1', 1, 2, 3));

        expect(repoCreateOrUpdateMethod).toHaveBeenCalledWith(1, [
            expect.objectContaining({
                jumpointId: 2,
                id: 3,
                lastSyncDate: new Date('2025-10-10'),
            }),
        ]);
    });
});

function mockJumpointNodeRepositoryService(): JumpointNodeRepositoryService {
    const service = {} as JumpointNodeRepositoryService;
    service.findOneBy = jest.fn().mockReturnValue(Promise.resolve({ jumpointId: 2, id: 3 } as JumpointNode));
    service.createOrUpdateByIdAndJumpointId = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
