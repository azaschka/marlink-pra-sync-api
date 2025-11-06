import { DataSource } from 'typeorm';
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

    describe('createOrUpdateByJumpointIdAndJumpointNodeId', () => {
        it('should call createOrUpdate with the correct parameters', async () => {
            const entities = [{ id: 1, jumpointId: 2, name: 'Test Jumpoint' }];
            const baseTenantRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'createOrUpdate')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateByJumpointIdAndJumpointNodeId(123, entities);

            expect(baseTenantRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(123, entities, ['id', 'jumpointId']);
        });
    });

    describe('deleteByJumpointId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const baseTenantRepositoryDeleteByMethod = jest
                .spyOn(BaseTenantRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByJumpointIdAndJumpointNodeId(123, 1, 2);

            expect(baseTenantRepositoryDeleteByMethod).toHaveBeenCalledWith(123, { jumpointId: 1, id: 2 });
        });
    });
});
