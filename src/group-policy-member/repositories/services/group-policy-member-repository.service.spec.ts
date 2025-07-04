import { DataSource, In } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
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
            const baseRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'createOrUpdate')
                .mockResolvedValue(Promise.resolve());

            await service.createOrUpdateByGroupPolicyIdAndMemberId([]);

            expect(baseRepositoryCreateOrUpdateMethod).not.toHaveBeenCalled();
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
            const baseRepositoryCreateOrUpdateMethod = jest.spyOn(BaseRepositoryService.prototype, 'createOrUpdate');

            await service.createOrUpdateByGroupPolicyIdAndMemberId(entities);

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

    describe('deleteByGroupPolicyIdAndMemberId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const groupPolicyId = 1;
            const memberId = 2;
            const expectedWhere = { groupPolicyId: groupPolicyId, memberId: memberId };
            const baseRepositoryDeleteByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByGroupPolicyIdAndMemberId(groupPolicyId, memberId);

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
