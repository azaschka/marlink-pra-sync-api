import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicyJumpGroup } from '../../models';
import { GroupPolicyJumpGroupRepositoryService } from '../../repositories/services/group-policy-jump-group-repository.service';
import { MarkGroupPolicyJumpGroupAsSyncedCommand } from '../mark-group-policy-jump-group-as-synced.command';
import { MarkGroupPolicyJumpGroupAsSyncedCommandHandler } from './mark-group-policy-jump-group-as-synced.command-handler';

describe('MarkGroupPolicyJumpGroupAsSyncedCommandHandler', () => {
    let groupPolicyJumpGroupRepositoryService: GroupPolicyJumpGroupRepositoryService;
    let handler: MarkGroupPolicyJumpGroupAsSyncedCommandHandler;

    beforeEach(() => {
        groupPolicyJumpGroupRepositoryService = mockGroupPolicyJumpGroupRepositoryService();
        handler = new MarkGroupPolicyJumpGroupAsSyncedCommandHandler(groupPolicyJumpGroupRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(groupPolicyJumpGroupRepositoryService, 'findOneBy').mockReturnValue(Promise.resolve(null));

        await expect(
            handler.execute(new MarkGroupPolicyJumpGroupAsSyncedCommand('transaction-1', 1, 2, 3)),
        ).rejects.toThrow(NotFoundException);
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateMethod = jest.spyOn(
            groupPolicyJumpGroupRepositoryService,
            'createOrUpdateByGroupPolicyIdAndJumpGroupId',
        );
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkGroupPolicyJumpGroupAsSyncedCommand('transaction-1', 1, 2, 3));

        expect(repoCreateOrUpdateMethod).toHaveBeenCalledWith(1, [
            expect.objectContaining({
                groupPolicyId: 2,
                jumpGroupId: 3,
                lastSyncDate: new Date('2025-10-10'),
            }),
        ]);
    });
});

function mockGroupPolicyJumpGroupRepositoryService(): GroupPolicyJumpGroupRepositoryService {
    const service = {} as GroupPolicyJumpGroupRepositoryService;
    service.findOneBy = jest
        .fn()
        .mockReturnValue(Promise.resolve({ groupPolicyId: 2, jumpGroupId: 3 } as GroupPolicyJumpGroup));
    service.createOrUpdateByGroupPolicyIdAndJumpGroupId = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
