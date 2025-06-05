import { DataSource, In } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { UserEntity } from '../../../user/repositories/entities';
import { UserGroupPolicyEntity } from '../entities';
import { UserGroupPolicyRepositoryService } from './user-group-policy-repository.service';

describe('UserGroupPolicyRepositoryService', () => {
    let service: UserGroupPolicyRepositoryService;
    let dataSource: DataSource;

    beforeEach(() => {
        jest.clearAllMocks();

        dataSource = {} as DataSource;
        service = new UserGroupPolicyRepositoryService(dataSource);
    });

    describe('createOrUpdateByUserIdAndGroupPolicyIds', () => {
        it('should not call createOrUpdate if entities are empty', async () => {
            const baseRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'createOrUpdate')
                .mockResolvedValue(Promise.resolve());

            await service.createOrUpdateByUserIdAndGroupPolicyIds([]);

            expect(baseRepositoryCreateOrUpdateMethod).not.toHaveBeenCalled();
        });

        it('should call createOrUpdate with the correct parameters when entities are provided', async () => {
            const entities: UserGroupPolicyEntity[] = [
                {
                    userId: 1,
                    groupPolicyId: 1,
                    user: { id: 1 } as UserEntity,
                    groupPolicy: { id: 1 } as GroupPolicyEntity,
                    lastSyncDate: new Date('2023-01-01'),
                },
                {
                    userId: 2,
                    groupPolicyId: 2,
                    user: { id: 2 } as UserEntity,
                    groupPolicy: { id: 2 } as GroupPolicyEntity,
                    lastSyncDate: new Date('2023-01-02'),
                },
            ];
            const expectedConflictPaths = ['userId', 'groupPolicyId'];
            const baseRepositoryCreateOrUpdateMethod = jest.spyOn(BaseRepositoryService.prototype, 'createOrUpdate');

            await service.createOrUpdateByUserIdAndGroupPolicyIds(entities);

            expect(baseRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(entities, expectedConflictPaths);
        });
    });

    describe('deleteByUserId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const id = 1;
            const expectedWhere = { userId: id };
            const baseRepositoryDeleteByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByUserId(id);

            expect(baseRepositoryDeleteByMethod).toHaveBeenCalledWith(expectedWhere);
        });
    });

    describe('deleteByUserIds', () => {
        it('should not call deleteBy if ids are empty', async () => {
            const baseRepositoryDeleteByMethod = jest.spyOn(BaseRepositoryService.prototype, 'deleteBy');

            await service.deleteByUserIds([]);

            expect(baseRepositoryDeleteByMethod).not.toHaveBeenCalled();
        });

        it('should call deleteBy with the correct parameters when ids are provided', async () => {
            const ids = [1, 2, 3];
            const expectedWhere = { userId: In(ids) };
            const baseRepositoryDeleteByMethod = jest.spyOn(BaseRepositoryService.prototype, 'deleteBy');

            await service.deleteByUserIds(ids);

            expect(baseRepositoryDeleteByMethod).toHaveBeenCalledWith(expectedWhere);
        });
    });
});
