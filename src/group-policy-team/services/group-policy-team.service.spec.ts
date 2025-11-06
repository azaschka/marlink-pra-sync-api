import { GroupPolicyTeamEntity } from '../repositories/entities';
import { GroupPolicyTeamRepositoryService } from '../repositories/services/group-policy-team-repository.service';
import { GroupPolicyTeamService } from './group-policy-team.service';

describe('GroupPolicyTeamService', () => {
    let service: GroupPolicyTeamService;
    let groupPolicyTeamRepositoryService: GroupPolicyTeamRepositoryService;

    beforeEach(() => {
        groupPolicyTeamRepositoryService = mockRepositoryService();
        service = new GroupPolicyTeamService(groupPolicyTeamRepositoryService);
    });

    describe('createOrUpdateByGroupPolicyIdAndTeamId', () => {
        it('should call repo with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test' } as Partial<GroupPolicyTeamEntity>;
            const repositoryCreateOrUpdateMethod = jest
                .spyOn(groupPolicyTeamRepositoryService, 'createOrUpdateByGroupPolicyIdAndTeamId')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateByGroupPolicyIdAndTeamId(123, entity);

            expect(repositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, [entity]);
        });
    });

    describe('deleteByGroupPolicyIdAndTeamId', () => {
        it('should call repo with the correct parameters', async () => {
            const repositoryDeleteByIdMethod = jest
                .spyOn(groupPolicyTeamRepositoryService, 'deleteByGroupPolicyIdAndTeamId')
                .mockReturnValue(Promise.resolve());

            await service.deleteByGroupPolicyIdAndTeamId(123, 1, 2);

            expect(repositoryDeleteByIdMethod).toHaveBeenCalledWith(123, 1, 2);
        });
    });
});

function mockRepositoryService(): GroupPolicyTeamRepositoryService {
    const repositoryService = {} as GroupPolicyTeamRepositoryService;

    repositoryService.createOrUpdateByGroupPolicyIdAndTeamId = jest.fn();
    repositoryService.deleteByGroupPolicyIdAndTeamId = jest.fn();

    return repositoryService;
}
