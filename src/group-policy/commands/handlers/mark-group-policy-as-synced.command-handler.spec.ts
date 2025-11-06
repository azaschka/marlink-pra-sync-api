import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicy } from '../../models';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { MarkGroupPolicyAsSyncedCommand } from '../mark-group-policy-as-synced.command';
import { MarkGroupPolicyAsSyncedCommandHandler } from './mark-group-policy-as-synced.command-handler';

describe('MarkGroupPolicyAsSyncedCommandHandler', () => {
    let groupPolicyRepositoryService: GroupPolicyRepositoryService;
    let handler: MarkGroupPolicyAsSyncedCommandHandler;

    beforeEach(() => {
        groupPolicyRepositoryService = mockGroupPolicyRepositoryService();
        handler = new MarkGroupPolicyAsSyncedCommandHandler(groupPolicyRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(groupPolicyRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkGroupPolicyAsSyncedCommand('transaction-1', 1, 2))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(groupPolicyRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkGroupPolicyAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockGroupPolicyRepositoryService(): GroupPolicyRepositoryService {
    const service = {} as GroupPolicyRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as GroupPolicy));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
