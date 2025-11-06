import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { TeamUser } from '../../models';
import { TeamUserRepositoryService } from '../../repositories/services/team-user-repository.service';
import { MarkTeamUserAsSyncedCommand } from '../mark-team-user-as-synced.command';
import { MarkTeamUserAsSyncedCommandHandler } from './mark-team-user-as-synced.command-handler';

describe('MarkTeamUserAsSyncedCommandHandler', () => {
    let teamUserRepositoryService: TeamUserRepositoryService;
    let handler: MarkTeamUserAsSyncedCommandHandler;

    beforeEach(() => {
        teamUserRepositoryService = mockTeamUserRepositoryService();
        handler = new MarkTeamUserAsSyncedCommandHandler(teamUserRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(teamUserRepositoryService, 'findOneBy').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkTeamUserAsSyncedCommand('transaction-1', 1, 2, 3))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateMethod = jest.spyOn(teamUserRepositoryService, 'createOrUpdateByTeamIdAndUserId');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkTeamUserAsSyncedCommand('transaction-1', 1, 2, 3));

        expect(repoCreateOrUpdateMethod).toHaveBeenCalledWith(1, [
            expect.objectContaining({
                teamId: 2,
                userId: 3,
                lastSyncDate: new Date('2025-10-10'),
            }),
        ]);
    });
});

function mockTeamUserRepositoryService(): TeamUserRepositoryService {
    const service = {} as TeamUserRepositoryService;
    service.findOneBy = jest.fn().mockReturnValue(Promise.resolve({ teamId: 2, userId: 3 } as TeamUser));
    service.createOrUpdateByTeamIdAndUserId = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
