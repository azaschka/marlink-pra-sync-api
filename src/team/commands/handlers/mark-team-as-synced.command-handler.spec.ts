import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { Team } from '../../models';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { MarkTeamAsSyncedCommand } from '../mark-team-as-synced.command';
import { MarkTeamAsSyncedCommandHandler } from './mark-team-as-synced.command-handler';

describe('MarkTeamAsSyncedCommandHandler', () => {
    let teamRepositoryService: TeamRepositoryService;
    let handler: MarkTeamAsSyncedCommandHandler;

    beforeEach(() => {
        teamRepositoryService = mockTeamRepositoryService();
        handler = new MarkTeamAsSyncedCommandHandler(teamRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(teamRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkTeamAsSyncedCommand('transaction-1', 1, 2))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(teamRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkTeamAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockTeamRepositoryService(): TeamRepositoryService {
    const service = {} as TeamRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as Team));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
