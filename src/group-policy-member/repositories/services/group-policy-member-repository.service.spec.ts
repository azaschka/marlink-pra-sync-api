import { DataSource, In } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { UserEntity } from '../../../user/repositories/entities';
import { GroupPolicyMemberEntity } from '../entities';
import { GroupPolicyMemberRepositoryService } from './group-policy-member-repository.service';

describe('GroupPolicyMemberRepositoryService', () => {
    let service: GroupPolicyMemberRepositoryService;
    let dataSource: DataSource;

    beforeEach(() => {
        jest.clearAllMocks();

        dataSource = {} as DataSource;
        service = new GroupPolicyMemberRepositoryService(dataSource);
    });

    describe('createOrUpdateByGroupPolicyIdAndMemberId', () => {
        it('should not call createOrUpdate if entities are empty', async () => {
            const baseTenantRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'createOrUpdate')
                .mockResolvedValue(Promise.resolve());

            await service.createOrUpdateByGroupPolicyIdAndMemberId(123, []);

            expect(baseTenantRepositoryCreateOrUpdateMethod).not.toHaveBeenCalled();
        });

        it('should call createOrUpdate with the correct parameters when entities are provided', async () => {
            const entities: GroupPolicyMemberEntity[] = [
                {
                    groupPolicyId: 1,
                    memberId: 1,
                    userId: 1,
                    securityProviderId: 1,
                    distinguishedName: 'Distinguished Name 1',
                    groupName: 'Group Name 1',
                    groupPolicy: { id: 1 } as GroupPolicyEntity,
                    user: { id: 1 } as UserEntity,
                    lastSyncDate: new Date('2023-01-01'),
                },
                {
                    groupPolicyId: 2,
                    memberId: 2,
                    userId: 2,
                    securityProviderId: 1,
                    distinguishedName: 'Distinguished Name 1',
                    groupName: 'Group Name 1',
                    groupPolicy: { id: 2 } as GroupPolicyEntity,
                    user: { id: 2 } as UserEntity,
                    lastSyncDate: new Date('2023-01-02'),
                },
            ];
            const expectedConflictPaths = ['groupPolicyId', 'memberId'];
            const baseTenantRepositoryCreateOrUpdateMethod = jest.spyOn(
                BaseTenantRepositoryService.prototype,
                'createOrUpdate',
            );

            await service.createOrUpdateByGroupPolicyIdAndMemberId(123, entities);

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

    describe('deleteByGroupPolicyIdAndMemberId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const groupPolicyId = 1;
            const memberId = 2;
            const expectedWhere = { groupPolicyId: groupPolicyId, memberId: memberId };
            const baseTenantRepositoryDeleteByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByGroupPolicyIdAndMemberId(123, groupPolicyId, memberId);

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
