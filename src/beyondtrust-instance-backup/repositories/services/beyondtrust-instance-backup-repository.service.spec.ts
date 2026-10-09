import { DataSource } from 'typeorm';
import { BaseRepositoryService } from '../../../core/services/base-repository.service';
import { BeyondtrustInstanceBackupRepositoryService } from './beyondtrust-instance-backup-repository.service';

describe('BeyondtrustInstanceBackupRepositoryService', () => {
    let service: BeyondtrustInstanceBackupRepositoryService;
    let dataSource: DataSource;

    beforeEach(() => {
        jest.clearAllMocks();

        dataSource = {} as DataSource;
        service = new BeyondtrustInstanceBackupRepositoryService(dataSource);
    });

    describe('createOrUpdateById', () => {
        it('should call createOrUpdate with the correct parameters', async () => {
            const entity = { id: 1, name: 'Test beyondtrust instance' };
            const expectedConflictPaths = ['id'];
            const baseRepositoryCreateOrUpdateMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'createOrUpdate')
                .mockReturnValue(Promise.resolve());

            await service.createOrUpdateById(entity);

            expect(baseRepositoryCreateOrUpdateMethod).toHaveBeenCalledWith(entity, expectedConflictPaths);
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

    describe('findAllNewestFirstPerInstance', () => {
        it('reads every backup ordered per instance, newest first', async () => {
            const baseRepositoryFindByMethod = jest
                .spyOn(BaseRepositoryService.prototype, 'findBy')
                .mockReturnValue(Promise.resolve([]));

            await service.findAllNewestFirstPerInstance();

            expect(baseRepositoryFindByMethod).toHaveBeenCalledWith({}, undefined, undefined, {
                beyondtrustInstanceId: 'ASC',
                creationDate: 'DESC',
                id: 'DESC',
            });
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
});
