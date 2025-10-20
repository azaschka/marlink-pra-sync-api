import { DataSource, LessThan } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { DiscrepancyEntityType } from '../../enums';
import { DiscrepancyRepositoryService } from './discrepancy-repository.service';

describe('DiscrepancyRepositoryService', () => {
    let service: DiscrepancyRepositoryService;
    let dataSource: DataSource;

    beforeEach(() => {
        jest.clearAllMocks();

        dataSource = {} as DataSource;
        service = new DiscrepancyRepositoryService(dataSource);
    });

    describe('createOrUpdateById', () => {
        it('should call createOrUpdate with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test beyondtrust instance' };
            const expectedConflictPaths = ['id'];
            const baseTenantRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'createOrUpdate')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(baseTenantRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, entity, expectedConflictPaths);
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

    describe('findOneByEntityTypeAndEntityId', () => {
        it('should call findOneBy with the correct parameters', async () => {
            const entityType = DiscrepancyEntityType.GroupPolicyJumpGroup;
            const entityId = 2;
            const expectedWhere = { entityType, entityId };
            const baseTenantRepositoryFindOneByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'findOneBy')
                .mockReturnValue(Promise.resolve());

            await service.findOneByEntityTypeAndEntityId(123, entityType, entityId);

            expect(baseTenantRepositoryFindOneByMethod).toHaveBeenCalledWith(123, expectedWhere);
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

    describe('deleteByLastModificationDateBefore', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const entityType = DiscrepancyEntityType.GroupPolicyJumpGroup;
            const date = new Date('2024-01-01T00:00:00Z');
            const expectedWhere = { entityType: entityType, lastModificationDate: LessThan(date) };
            const baseTenantRepositoryDeleteByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByLastModificationDateBefore(123, entityType, date);

            expect(baseTenantRepositoryDeleteByMethod).toHaveBeenCalledWith(123, expectedWhere);
        });
    });
});
