import { DataSource, In, LessThan } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { GroupPolicyEntity } from '../entities';
import { GroupPolicyRepositoryService } from './group-policy-repository.service';

describe('GroupPolicyRepositoryService', () => {
    let service: GroupPolicyRepositoryService;
    let dataSource: DataSource;

    beforeEach(() => {
        jest.clearAllMocks();

        dataSource = {} as DataSource;
        service = new GroupPolicyRepositoryService(dataSource);
    });

    describe('createOrUpdateById', () => {
        it('should call createOrUpdate with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test Policy' };
            const expectedConflictPaths = ['id'];
            const baseRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'createOrUpdate')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(entity);

            expect(baseRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(entity, expectedConflictPaths);
        });
    });

    describe('createOrUpdateByIds', () => {
        it('should not call createOrUpdate if entities are empty', async () => {
            const baseRepositoryCreateOrUpdateMethod = jest.spyOn(BaseRepositoryService.prototype, 'createOrUpdate');

            await service.createOrUpdateByIds([]);

            expect(baseRepositoryCreateOrUpdateMethod).not.toHaveBeenCalled();
        });

        it('should call createOrUpdate with the correct parameters when entities are provided', async () => {
            const entities: GroupPolicyEntity[] = [
                { id: 1, name: 'Group 1', lastSyncDate: new Date('2023-01-01'), userGroupPolicies: [] },
                { id: 2, name: 'Group 2', lastSyncDate: new Date('2023-01-02'), userGroupPolicies: [] },
            ];
            const expectedConflictPaths = ['id'];
            const baseRepositoryCreateOrUpdateMethod = jest.spyOn(BaseRepositoryService.prototype, 'createOrUpdate');

            await service.createOrUpdateByIds(entities);

            expect(baseRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(entities, expectedConflictPaths);
        });
    });

    describe('findOneById', () => {
        it('should call findOneBy with the correct parameters', async () => {
            const id = 1;
            const expectedWhere = { id: id };
            const baseRepositoryFindOneByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'findOneBy')
                .mockReturnValue(Promise.resolve());

            await service.findOneById(id);

            expect(baseRepositoryFindOneByMethod).toHaveBeenCalledWith(expectedWhere);
        });
    });

    describe('findByIds', () => {
        it('should return an empty array if ids are empty and not calling db operation', async () => {
            const baseRepositoryFindByMethod = jest.spyOn(BaseRepositoryService.prototype, 'findBy');

            const result = await service.findByIds([]);

            expect(result).toEqual([]);
            expect(baseRepositoryFindByMethod).not.toHaveBeenCalled();
        });

        it('should call findBy with the correct parameters when ids are provided', async () => {
            const ids = [1, 2, 3];
            const baseRepositoryFindByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'findBy')
                .mockReturnValue(Promise.resolve([]));

            await service.findByIds(ids);

            expect(baseRepositoryFindByMethod).toHaveBeenCalledWith({ id: In(ids) }, 1, 3);
        });
    });

    describe('findByLastSyncDateBefore', () => {
        it('should call findBy with the correct parameters', async () => {
            const date = new Date('2023-01-01');
            const pageNumber = 1;
            const pageSize = 10;
            const baseRepositoryFindByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'findBy')
                .mockReturnValue(Promise.resolve([]));

            await service.findByLastSyncDateBefore(date, pageNumber, pageSize);

            expect(baseRepositoryFindByMethod).toHaveBeenCalledWith(
                { lastSyncDate: LessThan(date) },
                pageNumber,
                pageSize,
            );
        });
    });

    describe('deleteById', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const id = 1;
            const expectedWhere = { id: id };
            const baseRepositoryDeleteByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteById(id);

            expect(baseRepositoryDeleteByMethod).toHaveBeenCalledWith(expectedWhere);
        });
    });

    describe('deleteByIds', () => {
        it('should not call deleteBy if ids are empty', async () => {
            const baseRepositoryDeleteByMethod = jest.spyOn(BaseRepositoryService.prototype, 'deleteBy');

            await service.deleteByIds([]);

            expect(baseRepositoryDeleteByMethod).not.toHaveBeenCalled();
        });

        it('should call deleteBy with the correct parameters when ids are provided', async () => {
            const ids = [1, 2, 3];
            const expectedWhere = { id: In(ids) };
            const baseRepositoryDeleteByMethod = jest.spyOn(BaseRepositoryService.prototype, 'deleteBy');

            await service.deleteByIds(ids);

            expect(baseRepositoryDeleteByMethod).toHaveBeenCalledWith(expectedWhere);
        });
    });
});
