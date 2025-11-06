import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { JumpPolicy } from '../../models';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { MarkJumpPolicyAsSyncedCommand } from '../mark-jump-policy-as-synced.command';
import { MarkJumpPolicyAsSyncedCommandHandler } from './mark-jump-policy-as-synced.command-handler';

describe('MarkJumpPolicyAsSyncedCommandHandler', () => {
    let jumpPolicyRepositoryService: JumpPolicyRepositoryService;
    let handler: MarkJumpPolicyAsSyncedCommandHandler;

    beforeEach(() => {
        jumpPolicyRepositoryService = mockJumpPolicyRepositoryService();
        handler = new MarkJumpPolicyAsSyncedCommandHandler(jumpPolicyRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(jumpPolicyRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkJumpPolicyAsSyncedCommand('transaction-1', 1, 2))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(jumpPolicyRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkJumpPolicyAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockJumpPolicyRepositoryService(): JumpPolicyRepositoryService {
    const service = {} as JumpPolicyRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as JumpPolicy));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
