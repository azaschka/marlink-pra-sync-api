import { DataSource } from 'typeorm';
import { BaseRepositoryService } from './base-repository.service';

class MockEntity {
    public id!: number;
}

abstract class TestHelper {
    public static mockRepositoryEntity(id: number): MockEntity {
        const entity = new MockEntity();
        entity.id = id;
        return entity;
    }
}

describe('BaseRepositoryService', () => {
    let service: BaseRepositoryService<MockEntity>;
    let dataSource: DataSource;

    beforeEach(() => {
        dataSource = mockDataSource();
        service = new BaseRepositoryService<MockEntity>(dataSource, MockEntity);
    });

    describe('create', () => {
        it('should connect to db, start transaction, save the entity, commit the transaction and release the connection ', async () => {
            const dataSourceCreateQueryRunnerConnectMethod = jest.spyOn(dataSource.createQueryRunner(), 'connect');
            const dataSourceCreateQueryRunnerStartTransactionMethod = jest.spyOn(
                dataSource.createQueryRunner(),
                'startTransaction',
            );
            const dataSourceCreateQueryRunnerManagerSaveMethod = jest.spyOn(
                dataSource.createQueryRunner().manager,
                'save',
            );
            const dataSourceCreateQueryRunnerCommitTransactionMethod = jest.spyOn(
                dataSource.createQueryRunner(),
                'commitTransaction',
            );
            const dataSourceCreateQueryRunnerRollbackTransactionMethod = jest.spyOn(
                dataSource.createQueryRunner(),
                'rollbackTransaction',
            );
            const dataSourceCreateQueryRunnerReleaseMethod = jest.spyOn(dataSource.createQueryRunner(), 'release');

            const entity = TestHelper.mockRepositoryEntity(1);

            await service.create(entity);

            expect(dataSourceCreateQueryRunnerConnectMethod).toHaveBeenCalledTimes(1);
            expect(dataSourceCreateQueryRunnerStartTransactionMethod).toHaveBeenCalledTimes(1);
            expect(dataSourceCreateQueryRunnerManagerSaveMethod).toHaveBeenCalledWith(MockEntity, entity);
            expect(dataSourceCreateQueryRunnerCommitTransactionMethod).toHaveBeenCalledTimes(1);
            expect(dataSourceCreateQueryRunnerRollbackTransactionMethod).not.toHaveBeenCalled();
            expect(dataSourceCreateQueryRunnerReleaseMethod).toHaveBeenCalledTimes(1);
        });

        it('should connect to db, start transaction, rollback the transaction and release the connection when an error occurs on saving or commiting the db operation', async () => {
            const dataSourceCreateQueryRunnerConnectMethod = jest.spyOn(dataSource.createQueryRunner(), 'connect');
            const dataSourceCreateQueryRunnerStartTransactionMethod = jest.spyOn(
                dataSource.createQueryRunner(),
                'startTransaction',
            );
            const dataSourceCreateQueryRunnerManagerSaveMethod = jest.spyOn(
                dataSource.createQueryRunner().manager,
                'save',
            );
            const dataSourceCreateQueryRunnerCommitTransactionMethod = jest.spyOn(
                dataSource.createQueryRunner(),
                'commitTransaction',
            );
            const dataSourceCreateQueryRunnerRollbackTransactionMethod = jest.spyOn(
                dataSource.createQueryRunner(),
                'rollbackTransaction',
            );
            const dataSourceCreateQueryRunnerReleaseMethod = jest.spyOn(dataSource.createQueryRunner(), 'release');

            const error = new Error('Error 123');
            const entity = TestHelper.mockRepositoryEntity(1);

            dataSourceCreateQueryRunnerManagerSaveMethod.mockImplementationOnce(() => {
                throw error;
            });

            await expect(service.create(entity)).rejects.toThrow(error);

            expect(dataSourceCreateQueryRunnerConnectMethod).toHaveBeenCalledTimes(1);
            expect(dataSourceCreateQueryRunnerStartTransactionMethod).toHaveBeenCalledTimes(1);
            expect(dataSourceCreateQueryRunnerManagerSaveMethod).toHaveBeenCalledWith(MockEntity, entity);
            expect(dataSourceCreateQueryRunnerCommitTransactionMethod).not.toHaveBeenCalled();
            expect(dataSourceCreateQueryRunnerRollbackTransactionMethod).toHaveBeenCalledTimes(1);
            expect(dataSourceCreateQueryRunnerReleaseMethod).toHaveBeenCalledTimes(1);
        });
    });
});

function mockDataSource(): DataSource {
    const dataSource = {} as DataSource;
    dataSource.createQueryRunner = jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
            save: jest.fn(),
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
    });

    return dataSource;
}
