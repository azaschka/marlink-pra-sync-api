import { DataSource } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { GroupPolicyRepositoryService } from './group-policy-repository.service';

describe('GroupPolicyRepositoryService', () => {
    let service: GroupPolicyRepositoryService;
    let dataSource: DataSource;

    beforeEach(() => {
        dataSource = {} as DataSource;
        service = new GroupPolicyRepositoryService(dataSource);
    });

    describe('createOrUpdateByBTId', () => {
        it('should call createOrUpdate with the correct parameters', async () => {
            const entity = { btId: 1, name: 'Test Policy' };
            const expectedConflictPaths = ['btId'];
            const baseRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'createOrUpdate')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateByBTId(entity);

            expect(baseRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(entity, expectedConflictPaths);
        });
    });

    describe('findOneByBTId', () => {
        it('should call findOneBy with the correct parameters', async () => {
            const btId = 1;
            const expectedWhere = { btId: btId };
            const baseRepositoryFindOneByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'findOneBy')
                .mockReturnValue(Promise.resolve());

            await service.findOneByBTId(btId);

            expect(baseRepositoryFindOneByMethod).toHaveBeenCalledWith(expectedWhere);
        });
    });

    describe('deleteByBTId', () => {
        it('should call deleteBy with the correct parameters', async () => {
            const btId = 1;
            const expectedWhere = { btId: btId };
            const baseRepositoryDeleteByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'deleteBy')
                .mockReturnValue(Promise.resolve());

            await service.deleteByBTId(btId);

            expect(baseRepositoryDeleteByMethod).toHaveBeenCalledWith(expectedWhere);
        });
    });
});
