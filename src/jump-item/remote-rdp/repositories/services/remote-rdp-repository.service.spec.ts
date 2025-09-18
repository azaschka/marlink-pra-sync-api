import { DataSource, In, LessThan } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../../core/services/base-tenant-repository.service';
import { JumpGroupEntity } from '../../../../jump-group/repositories/entities';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { RemoteRdpEntity } from '../entities';
import { RemoteRdpRepositoryService } from './remote-rdp-repository.service';

describe('RemoteRdpRepositoryService', () => {
    let service: RemoteRdpRepositoryService;
    let dataSource: DataSource;

    beforeEach(() => {
        jest.clearAllMocks();

        dataSource = {} as DataSource;
        service = new RemoteRdpRepositoryService(dataSource);
    });

    describe('createOrUpdateById', () => {
        it('should call createOrUpdate with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test remote rdp', jumpointId: 1, hostname: 'host-1', jumpGroupId: 1 };
            const expectedConflictPaths = ['id'];
            const baseTenantRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'createOrUpdate')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(baseTenantRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, entity, expectedConflictPaths);
        });
    });

    describe('createOrUpdateByIds', () => {
        it('should not call createOrUpdate if entities are empty', async () => {
            const baseTenantRepositoryCreateOrUpdateMethod = jest.spyOn(
                BaseTenantRepositoryService.prototype,
                'createOrUpdate',
            );

            await service.createOrUpdateByIds(123, []);

            expect(baseTenantRepositoryCreateOrUpdateMethod).not.toHaveBeenCalled();
        });

        it('should call createOrUpdate with the correct parameters when entities are provided', async () => {
            const entities: RemoteRdpEntity[] = [
                {
                    id: 1,
                    name: 'Remote rdp 1',
                    jumpointId: 1,
                    hostname: 'host-1',
                    jumpGroupId: 1,
                    lastSyncDate: new Date('2023-01-01'),
                    jumpoint: {} as JumpointEntity,
                    jumpGroup: {} as JumpGroupEntity,
                },
                {
                    id: 2,
                    name: 'Remote rdp 2',
                    jumpointId: 2,
                    hostname: 'host-2',
                    jumpGroupId: 2,
                    lastSyncDate: new Date('2023-01-02'),
                    jumpoint: {} as JumpointEntity,
                    jumpGroup: {} as JumpGroupEntity,
                },
            ];
            const expectedConflictPaths = ['id'];
            const baseTenantRepositoryCreateOrUpdateMethod = jest.spyOn(
                BaseTenantRepositoryService.prototype,
                'createOrUpdate',
            );

            await service.createOrUpdateByIds(123, entities);

            expect(baseTenantRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, entities, expectedConflictPaths);
        });
    });

    describe('findOneById', () => {
        it('should call findOneBy with the correct parameters', async () => {
            const id = 1;
            const expectedWhere = { id: id };
            const baseTenantRepositoryFindOneByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'findOneBy')
                .mockReturnValue(Promise.resolve());

            await service.findOneById(123, id);

            expect(baseTenantRepositoryFindOneByMethod).toHaveBeenCalledWith(123, expectedWhere);
        });
    });

    describe('findByIds', () => {
        it('should return an empty array if ids are empty and not calling db operation', async () => {
            const baseTenantRepositoryFindByMethod = jest.spyOn(BaseTenantRepositoryService.prototype, 'findBy');

            const result = await service.findByIds(123, []);

            expect(result).toEqual([]);
            expect(baseTenantRepositoryFindByMethod).not.toHaveBeenCalled();
        });

        it('should call findBy with the correct parameters when ids are provided', async () => {
            const ids = [1, 2, 3];
            const baseTenantRepositoryFindByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'findBy')
                .mockReturnValue(Promise.resolve([]));

            await service.findByIds(123, ids);

            expect(baseTenantRepositoryFindByMethod).toHaveBeenCalledWith(123, { id: In(ids) }, 1, 3);
        });
    });

    describe('findByLastSyncDateBefore', () => {
        it('should call findBy with the correct parameters', async () => {
            const date = new Date('2023-01-01');
            const pageNumber = 1;
            const pageSize = 10;
            const baseTenantRepositoryFindByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'findBy')
                .mockReturnValue(Promise.resolve([]));

            await service.findByLastSyncDateBefore(123, date, pageNumber, pageSize);

            expect(baseTenantRepositoryFindByMethod).toHaveBeenCalledWith(
                123,
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
            const baseTenantRepositoryDeleteByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteById(123, id);

            expect(baseTenantRepositoryDeleteByMethod).toHaveBeenCalledWith(123, expectedWhere);
        });
    });

    describe('deleteByIds', () => {
        it('should not call deleteBy if ids are empty', async () => {
            const baseTenantRepositoryDeleteByMethod = jest.spyOn(BaseTenantRepositoryService.prototype, 'deleteBy');

            await service.deleteByIds(123, []);

            expect(baseTenantRepositoryDeleteByMethod).not.toHaveBeenCalled();
        });

        it('should call deleteBy with the correct parameters when ids are provided', async () => {
            const ids = [1, 2, 3];
            const expectedWhere = { id: In(ids) };
            const baseTenantRepositoryDeleteByMethod = jest.spyOn(BaseTenantRepositoryService.prototype, 'deleteBy');

            await service.deleteByIds(123, ids);

            expect(baseTenantRepositoryDeleteByMethod).toHaveBeenCalledWith(123, expectedWhere);
        });
    });
});
