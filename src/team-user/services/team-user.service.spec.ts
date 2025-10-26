import { TeamUserEntity } from '../repositories/entities';
import { TeamUserRepositoryService } from '../repositories/services/team-user-repository.service';
import { TeamUserService } from './team-user.service';

describe('TeamUserService', () => {
    let service: TeamUserService;
    let teamUserRepositoryService: TeamUserRepositoryService;

    beforeEach(() => {
        teamUserRepositoryService = mockRepositoryService();
        service = new TeamUserService(teamUserRepositoryService);
    });

    describe('createOrUpdateByTeamIdAndUserId', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' } as Partial<TeamUserEntity>;
            const repositoryCreateOrUpdateMethod = jest
                .spyOn(teamUserRepositoryService, 'createOrUpdateByTeamIdAndUserId')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateByTeamIdAndUserId(123, entity);

            expect(repositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, [entity]);
        });
    });

    describe('deleteByTeamIdAndUserId', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(teamUserRepositoryService, 'deleteByTeamIdAndUserId')
                .mockReturnValue(Promise.resolve());

            await service.deleteByTeamIdAndUserId(123, 1, 2);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1, 2);
        });
    });
});

function mockRepositoryService(): TeamUserRepositoryService {
    const repositoryService = {} as TeamUserRepositoryService;

    repositoryService.createOrUpdateByTeamIdAndUserId = jest.fn();
    repositoryService.deleteByTeamIdAndUserId = jest.fn();

    return repositoryService;
}
