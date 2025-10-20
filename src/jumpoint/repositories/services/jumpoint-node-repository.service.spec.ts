import { DataSource, In } from 'typeorm';
import { BaseTenantRepositoryService } from '../../../core/services/base-tenant-repository.service';
import { JumpointNodeRepositoryService } from './jumpoint-node-repository.service';

describe('JumpointNodeRepositoryService', () => {
    let service: JumpointNodeRepositoryService;
    let dataSource: DataSource;

    beforeEach(() => {
        jest.clearAllMocks();

        dataSource = {} as DataSource;
        service = new JumpointNodeRepositoryService(dataSource);
    });

    describe('createOrUpdateById', () => {
        it('should call createOrUpdate with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test Jumpoint' };
            const expectedConflictPaths = ['id'];
            const baseTenantRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'createOrUpdate')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(123, entity);

            expect(baseTenantRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, entity, expectedConflictPaths);
        });
    });

    describe('createOrUpdateByIdAndJumpointId', () => {
        it('should call createOrUpdate with the correct parameters', async () => {
            const entities = [{ id: 1, jumpointId: 2, name: 'Test Jumpoint' }];
            const baseTenantRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'createOrUpdate')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateByIdAndJumpointId(123, entities);

            expect(baseTenantRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, entities, ['id', 'jumpointId']);
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

    describe('deleteByJumpointIds', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const jumpointIds = [1, 2, 3];
            const baseTenantRepositoryDeleteByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByJumpointIds(123, jumpointIds);

            expect(baseTenantRepositoryDeleteByMethod).toHaveBeenCalledWith(123, { jumpointId: In(jumpointIds) });
        });
    });

    describe('deleteByJumpointId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const jumpointId = 1;
            const baseTenantRepositoryDeleteByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByJumpointId(123, jumpointId);

            expect(baseTenantRepositoryDeleteByMethod).toHaveBeenCalledWith(123, { jumpointId });
        });
    });
});
