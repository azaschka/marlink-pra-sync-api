import { GroupPolicyTeamEntity } from '../../repositories/entities';
import { GroupPolicyTeamRepositoryService } from '../../repositories/services/group-policy-team-repository.service';
import { RetrieveGroupPolicyTeamsQuery } from '../retrieve-group-policy-teams.query';
import { RetrieveGroupPolicyTeamsQueryHandler } from './retrieve-group-policy-teams.query-handler';

describe('RetrieveGroupPolicyTeamsQueryHandler', () => {
    let groupPolicyTeamRepositoryService: GroupPolicyTeamRepositoryService;
    let handler: RetrieveGroupPolicyTeamsQueryHandler;

    beforeEach(() => {
        groupPolicyTeamRepositoryService = mockGroupPolicyTeamRepositoryService();
        handler = new RetrieveGroupPolicyTeamsQueryHandler(groupPolicyTeamRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedGroupPolicyTeamEntities = [
                {
                    groupPolicyId: 123,
                    teamId: 1,
                    team: {
                        id: 1,
                        name: 'Team 1',
                    },
                },
                {
                    groupPolicyId: 123,
                    teamId: 2,
                    team: {
                        id: 2,
                        name: 'Team 2',
                    },
                },
            ] as GroupPolicyTeamEntity[];
            const groupPolicyTeamRepositoryServiceFindByMethod = jest
                .spyOn(groupPolicyTeamRepositoryService, 'findBy')
                .mockResolvedValue(expectedGroupPolicyTeamEntities);

            const result = await handler.execute(new RetrieveGroupPolicyTeamsQuery('transaction-2', 100, 10, 1, 123));

            expect(result).toBe(expectedGroupPolicyTeamEntities);
            expect(groupPolicyTeamRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                100,
                { groupPolicyId: 123 },
                1,
                10,
            );
        });
    });
});

function mockGroupPolicyTeamRepositoryService() {
    const service = {} as GroupPolicyTeamRepositoryService;
    service.findBy = jest.fn();

    return service;
}
