import { TeamUserEntity } from '../../repositories/entities';
import { TeamUserRepositoryService } from '../../repositories/services/team-user-repository.service';
import { RetrieveTeamUsersQuery } from '../retrieve-team-users.query';
import { RetrieveTeamUsersQueryHandler } from './retrieve-team-users.query-handler';

describe('RetrieveTeamUsersQueryHandler', () => {
    let teamUserRepositoryService: TeamUserRepositoryService;
    let handler: RetrieveTeamUsersQueryHandler;

    beforeEach(() => {
        teamUserRepositoryService = mockTeamUserRepositoryService();
        handler = new RetrieveTeamUsersQueryHandler(teamUserRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedTeamUserEntities = [
                {
                    teamId: 123,
                    userId: 1,
                    user: {
                        id: 1,
                        publicDisplayName: 'User 1',
                    },
                },
                {
                    teamId: 123,
                    userId: 2,
                    user: {
                        id: 2,
                        publicDisplayName: 'User 2',
                    },
                },
            ] as TeamUserEntity[];
            const teamUserRepositoryServiceFindByMethod = jest
                .spyOn(teamUserRepositoryService, 'findBy')
                .mockResolvedValue(expectedTeamUserEntities);

            const result = await handler.execute(new RetrieveTeamUsersQuery('transaction-2', 10, 1, 123));

            expect(result).toBe(expectedTeamUserEntities);
            expect(teamUserRepositoryServiceFindByMethod).toHaveBeenCalledWith({ teamId: 123 }, 1, 10);
        });
    });
});

function mockTeamUserRepositoryService() {
    const service = {} as TeamUserRepositoryService;
    service.findBy = jest.fn();

    return service;
}
