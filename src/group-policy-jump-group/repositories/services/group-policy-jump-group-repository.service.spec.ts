import { DataSource, In } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { JumpGroupEntity } from '../../../jump-group/repositories/entities';
import { GroupPolicyJumpGroupEntity } from '../entities';
import { GroupPolicyJumpGroupRepositoryService } from './group-policy-jump-group-repository.service';

describe('GroupPolicyJumpGroupRepositoryService', () => {
    let service: GroupPolicyJumpGroupRepositoryService;
    let dataSource: DataSource;

    beforeEach(() => {
        jest.clearAllMocks();

        dataSource = {} as DataSource;
        service = new GroupPolicyJumpGroupRepositoryService(dataSource);
    });

    describe('createOrUpdateByGroupPolicyIdAndJumpGroupId', () => {
        it('should not call createOrUpdate if entities are empty', async () => {
            const baseRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'createOrUpdate')
                .mockResolvedValue(Promise.resolve());

            await service.createOrUpdateByGroupPolicyIdAndJumpGroupId([]);

            expect(baseRepositoryCreateOrUpdateMethod).not.toHaveBeenCalled();
        });

        it('should call createOrUpdate with the correct parameters when entities are provided', async () => {
            const entities: GroupPolicyJumpGroupEntity[] = [
                {
                    groupPolicyId: 1,
                    jumpGroupId: 1,
                    groupPolicy: { id: 1 } as GroupPolicyEntity,
                    jumpGroup: { id: 1 } as JumpGroupEntity,
                    lastSyncDate: new Date('2023-01-01'),
                },
                {
                    groupPolicyId: 2,
                    jumpGroupId: 2,
                    groupPolicy: { id: 2 } as GroupPolicyEntity,
                    jumpGroup: { id: 2 } as JumpGroupEntity,
                    lastSyncDate: new Date('2023-01-02'),
                },
            ];
            const expectedConflictPaths = ['groupPolicyId', 'jumpGroupId'];
            const baseRepositoryCreateOrUpdateMethod = jest.spyOn(BaseRepositoryService.prototype, 'createOrUpdate');

            await service.createOrUpdateByGroupPolicyIdAndJumpGroupId(entities);

            expect(baseRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(entities, expectedConflictPaths);
        });
    });

    describe('deleteByGroupPolicyId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const id = 1;
            const expectedWhere = { groupPolicyId: id };
            const baseRepositoryDeleteByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByGroupPolicyId(id);

            expect(baseRepositoryDeleteByMethod).toHaveBeenCalledWith(expectedWhere);
        });
    });

    describe('deleteByGroupPolicyIdAndJumpGroupId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const groupPolicyId = 1;
            const jumpGroupId = 2;
            const expectedWhere = { groupPolicyId: groupPolicyId, jumpGroupId: jumpGroupId };
            const baseRepositoryDeleteByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByGroupPolicyIdAndJumpGroupId(groupPolicyId, jumpGroupId);

            expect(baseRepositoryDeleteByMethod).toHaveBeenCalledWith(expectedWhere);
        });
    });

    describe('deleteByGroupPolicyIds', () => {
        it('should not call deleteBy if ids are empty', async () => {
            const baseRepositoryDeleteByMethod = jest.spyOn(BaseRepositoryService.prototype, 'deleteBy');

            await service.deleteByGroupPolicyIds([]);

            expect(baseRepositoryDeleteByMethod).not.toHaveBeenCalled();
        });

        it('should call deleteBy with the correct parameters when ids are provided', async () => {
            const ids = [1, 2, 3];
            const expectedWhere = { groupPolicyId: In(ids) };
            const baseRepositoryDeleteByMethod = jest.spyOn(BaseRepositoryService.prototype, 'deleteBy');

            await service.deleteByGroupPolicyIds(ids);

            expect(baseRepositoryDeleteByMethod).toHaveBeenCalledWith(expectedWhere);
        });
    });
});
