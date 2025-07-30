import { DataSource, In } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { JumpointNodeRepositoryService } from './jumpoint-node-repository.service';

describe('JumpointNodeRepositoryService', () => {
    let service: JumpointNodeRepositoryService;
    let dataSource: DataSource;

    beforeEach(() => {
        jest.clearAllMocks();

        dataSource = {} as DataSource;
        service = new JumpointNodeRepositoryService(dataSource);
    });

    describe('createOrUpdateByIdAndJumpointId', () => {
        it('should call createOrUpdate with the correct parameters', async () => {
            const entities = [{ id: 1, jumpointId: 2, name: 'Test Jumpoint' }];
            const baseRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'createOrUpdate')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateByIdAndJumpointId(entities);

            expect(baseRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(entities, ['id', 'jumpointId']);
        });
    });

    describe('deleteByJumpointIds', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const jumpointIds = [1, 2, 3];
            const baseRepositoryDeleteByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByJumpointIds(jumpointIds);

            expect(baseRepositoryDeleteByMethod).toHaveBeenCalledWith({ jumpointId: In(jumpointIds) });
        });
    });

    describe('deleteByJumpointId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const jumpointId = 1;
            const baseRepositoryDeleteByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByJumpointId(jumpointId);

            expect(baseRepositoryDeleteByMethod).toHaveBeenCalledWith({ jumpointId });
        });
    });
});
