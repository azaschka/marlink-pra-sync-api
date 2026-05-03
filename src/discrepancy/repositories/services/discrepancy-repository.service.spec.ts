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

    describe('findOneByEntityTypeEntityIdAndForeignEntityId', () => {
        it('should call findOneBy with the correct parameters', async () => {
            const entityType = DiscrepancyEntityType.GroupPolicyJumpGroup;
            const entityId = 2;
            const foreignEntityId = 3;
            const expectedWhere = { entityType, entityId, foreignEntityId };
            const baseTenantRepositoryFindOneByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'findOneBy')
                .mockReturnValue(Promise.resolve());

            await service.findOneByEntityTypeEntityIdAndForeignEntityId(123, entityType, entityId, foreignEntityId);

            expect(baseTenantRepositoryFindOneByMethod).toHaveBeenCalledWith(123, expectedWhere);
        });
    });

    describe('findManyByEntityType', () => {
        it('should call findBy with entityType and undefined pagination to fetch all records without paging', async () => {
            // Arrange
            const entityType = DiscrepancyEntityType.GroupPolicyJumpGroup;
            const expectedWhere = { entityType };
            const baseTenantRepositoryFindByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'findBy')
                .mockResolvedValue([]);

            // Act
            await service.findManyByEntityType(123, entityType);

            // Assert
            expect(baseTenantRepositoryFindByMethod).toHaveBeenCalledWith(123, expectedWhere, undefined, undefined);
        });

        it('should return empty array when no discrepancies exist for entity type', async () => {
            // Arrange
            jest.spyOn(BaseTenantRepositoryService.prototype, 'findBy').mockResolvedValue([]);

            // Act
            const result = await service.findManyByEntityType(123, DiscrepancyEntityType.User);

            // Assert
            expect(result).toEqual([]);
        });

        it('should return all records returned by the base findBy method', async () => {
            // Arrange
            const records = [
                { id: 1, entityId: 10 },
                { id: 2, entityId: 20 },
            ];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            jest.spyOn(BaseTenantRepositoryService.prototype, 'findBy').mockResolvedValue(records as any);

            // Act
            const result = await service.findManyByEntityType(123, DiscrepancyEntityType.User);

            // Assert
            expect(result).toEqual(records);
        });

        it('should pass undefined for pageNumber and pageSize to retrieve all records unpaged', async () => {
            // Arrange
            const findByMethod = jest.spyOn(BaseTenantRepositoryService.prototype, 'findBy').mockResolvedValue([]);

            // Act
            await service.findManyByEntityType(456, DiscrepancyEntityType.JumpClient);

            // Assert – third and fourth args must be undefined (no skip, no take)
            const firstCall = findByMethod.mock.calls[0] as unknown[];
            const pageNumber = firstCall[2];
            const pageSize = firstCall[3];
            expect(pageNumber).toBeUndefined();
            expect(pageSize).toBeUndefined();
        });
    });

    describe('findManyByEntityTypeAndEntityId', () => {
        it('should call findBy with entityType, entityId and undefined pagination to fetch all records', async () => {
            // Arrange
            const entityType = DiscrepancyEntityType.GroupPolicyJumpGroup;
            const entityId = 42;
            const expectedWhere = { entityType, entityId };
            const baseTenantRepositoryFindByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'findBy')
                .mockResolvedValue([]);

            // Act
            await service.findManyByEntityTypeAndEntityId(123, entityType, entityId);

            // Assert
            expect(baseTenantRepositoryFindByMethod).toHaveBeenCalledWith(123, expectedWhere, undefined, undefined);
        });

        it('should return empty array when no relational discrepancies exist for the parent', async () => {
            // Arrange
            jest.spyOn(BaseTenantRepositoryService.prototype, 'findBy').mockResolvedValue([]);

            // Act
            const result = await service.findManyByEntityTypeAndEntityId(
                123,
                DiscrepancyEntityType.GroupPolicyJumpGroup,
                99,
            );

            // Assert
            expect(result).toEqual([]);
        });

        it('should return all relational records for the given parent entity', async () => {
            // Arrange
            const records = [
                { id: 1, entityId: 5, foreignEntityId: 10 },
                { id: 2, entityId: 5, foreignEntityId: 20 },
            ];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            jest.spyOn(BaseTenantRepositoryService.prototype, 'findBy').mockResolvedValue(records as any);

            // Act
            const result = await service.findManyByEntityTypeAndEntityId(
                123,
                DiscrepancyEntityType.GroupPolicyJumpGroup,
                5,
            );

            // Assert
            expect(result).toEqual(records);
        });

        it('should scope the where clause to the given entityId (parent)', async () => {
            // Arrange
            const findByMethod = jest.spyOn(BaseTenantRepositoryService.prototype, 'findBy').mockResolvedValue([]);

            // Act
            await service.findManyByEntityTypeAndEntityId(789, DiscrepancyEntityType.UserGroupPolicy, 17);

            // Assert – where must include the parent entityId
            const firstCall = findByMethod.mock.calls[0] as unknown[];
            const where = firstCall[1];
            expect(where).toEqual({ entityType: DiscrepancyEntityType.UserGroupPolicy, entityId: 17 });
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
