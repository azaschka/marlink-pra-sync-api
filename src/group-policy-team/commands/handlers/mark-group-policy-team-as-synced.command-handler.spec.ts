import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicyTeam } from '../../models';
import { GroupPolicyTeamRepositoryService } from '../../repositories/services/group-policy-team-repository.service';
import { MarkGroupPolicyTeamAsSyncedCommand } from '../mark-group-policy-team-as-synced.command';
import { MarkGroupPolicyTeamAsSyncedCommandHandler } from './mark-group-policy-team-as-synced.command-handler';

describe('MarkGroupPolicyTeamAsSyncedCommandHandler', () => {
    let groupPolicyTeamRepositoryService: GroupPolicyTeamRepositoryService;
    let handler: MarkGroupPolicyTeamAsSyncedCommandHandler;

    beforeEach(() => {
        groupPolicyTeamRepositoryService = mockGroupPolicyTeamRepositoryService();
        handler = new MarkGroupPolicyTeamAsSyncedCommandHandler(groupPolicyTeamRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(groupPolicyTeamRepositoryService, 'findOneBy').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkGroupPolicyTeamAsSyncedCommand('transaction-1', 1, 2, 3))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateMethod = jest.spyOn(
            groupPolicyTeamRepositoryService,
            'createOrUpdateByGroupPolicyIdAndTeamId',
        );
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkGroupPolicyTeamAsSyncedCommand('transaction-1', 1, 2, 3));

        expect(repoCreateOrUpdateMethod).toHaveBeenCalledWith(1, [
            expect.objectContaining({
                groupPolicyId: 2,
                teamId: 3,
                lastSyncDate: new Date('2025-10-10'),
            }),
        ]);
    });
});

function mockGroupPolicyTeamRepositoryService(): GroupPolicyTeamRepositoryService {
    const service = {} as GroupPolicyTeamRepositoryService;
    service.findOneBy = jest.fn().mockReturnValue(Promise.resolve({ groupPolicyId: 2, teamId: 3 } as GroupPolicyTeam));
    service.createOrUpdateByGroupPolicyIdAndTeamId = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
