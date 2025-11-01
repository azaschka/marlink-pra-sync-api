import { NotFoundException } from '@nestjs/common';
import { TeamEntity } from '../../repositories/entities';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { RetrieveTeamByIdQuery } from '../retrieve-team-by-id.query';
import { RetrieveTeamByIdQueryHandler } from './retrieve-team-by-id.query-handler';

describe('RetrieveTeamByIdQueryHandler', () => {
    let teamRepositoryService: TeamRepositoryService;
    let handler: RetrieveTeamByIdQueryHandler;

    beforeEach(() => {
        teamRepositoryService = mockTeamRepositoryService();
        handler = new RetrieveTeamByIdQueryHandler(teamRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(teamRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(handler.execute(new RetrieveTeamByIdQuery('transaction-1', 1, 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return value from the repo', async () => {
            const expectedTeam = { id: 123 } as TeamEntity;
            const teamRepositoryServiceFindOneByIdMethod = jest
                .spyOn(teamRepositoryService, 'findOneById')
                .mockResolvedValue(expectedTeam);

            const result = await handler.execute(new RetrieveTeamByIdQuery('transaction-1', 1, 123));

            expect(result).toBe(expectedTeam);
            expect(teamRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(1, 123);
        });
    });
});

function mockTeamRepositoryService() {
    const service = {} as TeamRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
