import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicyMember } from '../../models';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { MarkGroupPolicyMemberAsSyncedCommand } from '../mark-group-policy-member-as-synced.command';
import { MarkGroupPolicyMemberAsSyncedCommandHandler } from './mark-group-policy-member-as-synced.command-handler';

describe('MarkGroupPolicyMemberAsSyncedCommandHandler', () => {
    let groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService;
    let handler: MarkGroupPolicyMemberAsSyncedCommandHandler;

    beforeEach(() => {
        groupPolicyMemberRepositoryService = mockGroupPolicyMemberRepositoryService();
        handler = new MarkGroupPolicyMemberAsSyncedCommandHandler(groupPolicyMemberRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(groupPolicyMemberRepositoryService, 'findOneBy').mockReturnValue(Promise.resolve(null));

        await expect(
            handler.execute(new MarkGroupPolicyMemberAsSyncedCommand('transaction-1', 1, 2, 3)),
        ).rejects.toThrow(NotFoundException);
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateMethod = jest.spyOn(
            groupPolicyMemberRepositoryService,
            'createOrUpdateByGroupPolicyIdAndMemberId',
        );
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkGroupPolicyMemberAsSyncedCommand('transaction-1', 1, 2, 3));

        expect(repoCreateOrUpdateMethod).toHaveBeenCalledWith(1, [
            expect.objectContaining({
                groupPolicyId: 2,
                memberId: 3,
                lastSyncDate: new Date('2025-10-10'),
            }),
        ]);
    });
});

function mockGroupPolicyMemberRepositoryService(): GroupPolicyMemberRepositoryService {
    const service = {} as GroupPolicyMemberRepositoryService;
    service.findOneBy = jest
        .fn()
        .mockReturnValue(Promise.resolve({ groupPolicyId: 2, memberId: 3 } as GroupPolicyMember));
    service.createOrUpdateByGroupPolicyIdAndMemberId = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
