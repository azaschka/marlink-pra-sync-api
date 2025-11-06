import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicyJumpoint } from '../../models';
import { GroupPolicyJumpointRepositoryService } from '../../repositories/services/group-policy-jumpoint-repository.service';
import { MarkGroupPolicyJumpointAsSyncedCommand } from '../mark-group-policy-jumpoint-as-synced.command';
import { MarkGroupPolicyJumpointAsSyncedCommandHandler } from './mark-group-policy-jumpoint-as-synced.command-handler';

describe('MarkGroupPolicyJumpointAsSyncedCommandHandler', () => {
    let groupPolicyJumpointRepositoryService: GroupPolicyJumpointRepositoryService;
    let handler: MarkGroupPolicyJumpointAsSyncedCommandHandler;

    beforeEach(() => {
        groupPolicyJumpointRepositoryService = mockGroupPolicyJumpointRepositoryService();
        handler = new MarkGroupPolicyJumpointAsSyncedCommandHandler(groupPolicyJumpointRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(groupPolicyJumpointRepositoryService, 'findOneBy').mockReturnValue(Promise.resolve(null));

        await expect(
            handler.execute(new MarkGroupPolicyJumpointAsSyncedCommand('transaction-1', 1, 2, 3)),
        ).rejects.toThrow(NotFoundException);
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateMethod = jest.spyOn(
            groupPolicyJumpointRepositoryService,
            'createOrUpdateByGroupPolicyIdAndJumpointId',
        );
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkGroupPolicyJumpointAsSyncedCommand('transaction-1', 1, 2, 3));

        expect(repoCreateOrUpdateMethod).toHaveBeenCalledWith(1, [
            expect.objectContaining({
                groupPolicyId: 2,
                jumpointId: 3,
                lastSyncDate: new Date('2025-10-10'),
            }),
        ]);
    });
});

function mockGroupPolicyJumpointRepositoryService(): GroupPolicyJumpointRepositoryService {
    const service = {} as GroupPolicyJumpointRepositoryService;
    service.findOneBy = jest
        .fn()
        .mockReturnValue(Promise.resolve({ groupPolicyId: 2, jumpointId: 3 } as GroupPolicyJumpoint));
    service.createOrUpdateByGroupPolicyIdAndJumpointId = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
