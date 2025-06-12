import { TeamEntity } from '../../repositories/entities';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { RetrieveTeamsQuery } from '../retrieve-teams.query';
import { RetrieveTeamsQueryHandler } from './retrieve-teams.query-handler';

describe('RetrieveTeamsQueryHandler', () => {
    let teamRepositoryService: TeamRepositoryService;
    let handler: RetrieveTeamsQueryHandler;

    beforeEach(() => {
        teamRepositoryService = mockTeamRepositoryService();
        handler = new RetrieveTeamsQueryHandler(teamRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedTeams = [] as TeamEntity[];
            const teamRepositoryServiceFindByMethod = jest
                .spyOn(teamRepositoryService, 'findBy')
                .mockResolvedValue(expectedTeams);

            const result = await handler.execute(new RetrieveTeamsQuery('transaction-1', 20, 2));

            expect(result).toBe(expectedTeams);
            expect(teamRepositoryServiceFindByMethod).toHaveBeenCalledWith({}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedTeams = [] as TeamEntity[];
            const teamRepositoryServiceFindByMethod = jest
                .spyOn(teamRepositoryService, 'findBy')
                .mockResolvedValue(expectedTeams);

            const result = await handler.execute(
                new RetrieveTeamsQuery('transaction-2', 10, 1, 'team-1', 'team-code-1'),
            );

            expect(result).toBe(expectedTeams);
            expect(teamRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                { name: 'team-1', codeName: 'team-code-1' },
                1,
                10,
            );
        });
    });
});

function mockTeamRepositoryService() {
    const service = {} as TeamRepositoryService;
    service.findBy = jest.fn();

    return service;
}
