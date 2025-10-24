import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { UserGroupPolicy } from '../../models';
import { UserGroupPolicyRepositoryService } from '../../repositories/services/user-group-policy-repository.service';
import { MarkUserGroupPolicyAsSyncedCommand } from '../mark-user-group-policy-as-synced.command';
import { MarkUserGroupPolicyAsSyncedCommandHandler } from './mark-user-group-policy-as-synced.command-handler';

describe('MarkUserGroupPolicyAsSyncedCommandHandler', () => {
    let userGroupPolicyRepositoryService: UserGroupPolicyRepositoryService;
    let handler: MarkUserGroupPolicyAsSyncedCommandHandler;

    beforeEach(() => {
        userGroupPolicyRepositoryService = mockUserGroupPolicyRepositoryService();
        handler = new MarkUserGroupPolicyAsSyncedCommandHandler(userGroupPolicyRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(userGroupPolicyRepositoryService, 'findOneBy').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkUserGroupPolicyAsSyncedCommand('transaction-1', 1, 2, 3))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateMethod = jest.spyOn(
            userGroupPolicyRepositoryService,
            'createOrUpdateByUserIdAndGroupPolicyId',
        );
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkUserGroupPolicyAsSyncedCommand('transaction-1', 1, 2, 3));

        expect(repoCreateOrUpdateMethod).toHaveBeenCalledWith(1, [
            expect.objectContaining({
                userId: 2,
                groupPolicyId: 3,
                lastSyncDate: new Date('2025-10-10'),
            }),
        ]);
    });
});

function mockUserGroupPolicyRepositoryService(): UserGroupPolicyRepositoryService {
    const service = {} as UserGroupPolicyRepositoryService;
    service.findOneBy = jest.fn().mockReturnValue(Promise.resolve({ userId: 2, groupPolicyId: 3 } as UserGroupPolicy));
    service.createOrUpdateByUserIdAndGroupPolicyId = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
