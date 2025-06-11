import { DataSource, In } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { TeamEntity } from '../../../team/repositories/entities';
import { UserEntity } from '../../../user/repositories/entities';
import { UserTeamRoleType } from '../../enums';
import { TeamUserEntity } from '../entities';
import { TeamUserRepositoryService } from './team-user-repository.service';

describe('TeamUserRepositoryService', () => {
    let service: TeamUserRepositoryService;
    let dataSource: DataSource;

    beforeEach(() => {
        jest.clearAllMocks();

        dataSource = {} as DataSource;
        service = new TeamUserRepositoryService(dataSource);
    });

    describe('createOrUpdateByTeamIdAndUserId', () => {
        it('should not call createOrUpdate if entities are empty', async () => {
            const baseRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'createOrUpdate')
                .mockResolvedValue(Promise.resolve());

            await service.createOrUpdateByTeamIdAndUserId([]);

            expect(baseRepositoryCreateOrUpdateMethod).not.toHaveBeenCalled();
        });

        it('should call createOrUpdate with the correct parameters when entities are provided', async () => {
            const entities: TeamUserEntity[] = [
                {
                    userId: 1,
                    teamId: 1,
                    roleType: UserTeamRoleType.Member,
                    user: { id: 1 } as UserEntity,
                    team: { id: 1 } as TeamEntity,
                    lastSyncDate: new Date('2023-01-01'),
                },
                {
                    userId: 2,
                    teamId: 2,
                    roleType: UserTeamRoleType.Manager,
                    user: { id: 2 } as UserEntity,
                    team: { id: 2 } as TeamEntity,
                    lastSyncDate: new Date('2023-01-02'),
                },
            ];
            const expectedConflictPaths = ['teamId', 'userId'];
            const baseRepositoryCreateOrUpdateMethod = jest.spyOn(BaseRepositoryService.prototype, 'createOrUpdate');

            await service.createOrUpdateByTeamIdAndUserId(entities);

            expect(baseRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(entities, expectedConflictPaths);
        });
    });

    describe('deleteByTeamId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const id = 1;
            const expectedWhere = { teamId: id };
            const baseRepositoryDeleteByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByTeamId(id);

            expect(baseRepositoryDeleteByMethod).toHaveBeenCalledWith(expectedWhere);
        });
    });

    describe('deleteByTeamIdAndUserId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const teamId = 1;
            const userId = 2;
            const expectedWhere = { teamId: teamId, userId: userId };
            const baseRepositoryDeleteByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByTeamIdAndUserId(teamId, userId);

            expect(baseRepositoryDeleteByMethod).toHaveBeenCalledWith(expectedWhere);
        });
    });

    describe('deleteByTeamIds', () => {
        it('should not call deleteBy if ids are empty', async () => {
            const baseRepositoryDeleteByMethod = jest.spyOn(BaseRepositoryService.prototype, 'deleteBy');

            await service.deleteByTeamIds([]);

            expect(baseRepositoryDeleteByMethod).not.toHaveBeenCalled();
        });

        it('should call deleteBy with the correct parameters when ids are provided', async () => {
            const ids = [1, 2, 3];
            const expectedWhere = { teamId: In(ids) };
            const baseRepositoryDeleteByMethod = jest.spyOn(BaseRepositoryService.prototype, 'deleteBy');

            await service.deleteByTeamIds(ids);

            expect(baseRepositoryDeleteByMethod).toHaveBeenCalledWith(expectedWhere);
        });
    });
});
