import { DataSource, In } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { JumpointEntity } from '../../../jumpoint/repositories/entities';
import { GroupPolicyJumpointEntity } from '../entities';
import { GroupPolicyJumpointRepositoryService } from './group-policy-jumpoint-repository.service';

describe('GroupPolicyJumpointRepositoryService', () => {
    let service: GroupPolicyJumpointRepositoryService;
    let dataSource: DataSource;

    beforeEach(() => {
        jest.clearAllMocks();

        dataSource = {} as DataSource;
        service = new GroupPolicyJumpointRepositoryService(dataSource);
    });

    describe('createOrUpdateByGroupPolicyIdAndJumpointId', () => {
        it('should not call createOrUpdate if entities are empty', async () => {
            const baseRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'createOrUpdate')
                .mockResolvedValue(Promise.resolve());

            await service.createOrUpdateByGroupPolicyIdAndJumpointId([]);

            expect(baseRepositoryCreateOrUpdateMethod).not.toHaveBeenCalled();
        });

        it('should call createOrUpdate with the correct parameters when entities are provided', async () => {
            const entities: GroupPolicyJumpointEntity[] = [
                {
                    groupPolicyId: 1,
                    jumpointId: 1,
                    groupPolicy: { id: 1 } as GroupPolicyEntity,
                    jumpoint: { id: 1 } as JumpointEntity,
                    lastSyncDate: new Date('2023-01-01'),
                },
                {
                    groupPolicyId: 2,
                    jumpointId: 2,
                    groupPolicy: { id: 2 } as GroupPolicyEntity,
                    jumpoint: { id: 2 } as JumpointEntity,
                    lastSyncDate: new Date('2023-01-02'),
                },
            ];
            const expectedConflictPaths = ['groupPolicyId', 'jumpointId'];
            const baseRepositoryCreateOrUpdateMethod = jest.spyOn(BaseRepositoryService.prototype, 'createOrUpdate');

            await service.createOrUpdateByGroupPolicyIdAndJumpointId(entities);

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

    describe('deleteByGroupPolicyIdAndJumpointId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const groupPolicyId = 1;
            const jumpointId = 2;
            const expectedWhere = { groupPolicyId: groupPolicyId, jumpointId: jumpointId };
            const baseRepositoryDeleteByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByGroupPolicyIdAndJumpointId(groupPolicyId, jumpointId);

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
