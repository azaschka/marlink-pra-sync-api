import { DataSource, In } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
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
            const baseTenantRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'createOrUpdate')
                .mockResolvedValue(Promise.resolve());

            await service.createOrUpdateByGroupPolicyIdAndJumpointId(123, []);

            expect(baseTenantRepositoryCreateOrUpdateMethod).not.toHaveBeenCalled();
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
            const baseTenantRepositoryCreateOrUpdateMethod = jest.spyOn(
                BaseTenantRepositoryService.prototype,
                'createOrUpdate',
            );

            await service.createOrUpdateByGroupPolicyIdAndJumpointId(123, entities);

            expect(baseTenantRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, entities, expectedConflictPaths);
        });
    });

    describe('deleteByGroupPolicyId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const id = 1;
            const expectedWhere = { groupPolicyId: id };
            const baseTenantRepositoryDeleteByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByGroupPolicyId(123, id);

            expect(baseTenantRepositoryDeleteByMethod).toHaveBeenCalledWith(123, expectedWhere);
        });
    });

    describe('deleteByGroupPolicyIdAndJumpointId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const groupPolicyId = 1;
            const jumpointId = 2;
            const expectedWhere = { groupPolicyId: groupPolicyId, jumpointId: jumpointId };
            const baseTenantRepositoryDeleteByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByGroupPolicyIdAndJumpointId(123, groupPolicyId, jumpointId);

            expect(baseTenantRepositoryDeleteByMethod).toHaveBeenCalledWith(123, expectedWhere);
        });
    });

    describe('deleteByGroupPolicyIds', () => {
        it('should not call deleteBy if ids are empty', async () => {
            const baseTenantRepositoryDeleteByMethod = jest.spyOn(BaseTenantRepositoryService.prototype, 'deleteBy');

            await service.deleteByGroupPolicyIds(123, []);

            expect(baseTenantRepositoryDeleteByMethod).not.toHaveBeenCalled();
        });

        it('should call deleteBy with the correct parameters when ids are provided', async () => {
            const ids = [1, 2, 3];
            const expectedWhere = { groupPolicyId: In(ids) };
            const baseTenantRepositoryDeleteByMethod = jest.spyOn(BaseTenantRepositoryService.prototype, 'deleteBy');

            await service.deleteByGroupPolicyIds(123, ids);

            expect(baseTenantRepositoryDeleteByMethod).toHaveBeenCalledWith(123, expectedWhere);
        });
    });
});
