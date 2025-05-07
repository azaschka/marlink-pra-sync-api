import { DataSource } from 'typeorm';
import { BaseRepositoryService } from './base-repository.service';

class MockEntity {
    public id?: number;
    public name!: string;
}

abstract class TestHelper {
    public static mockRepositoryEntity(name: string): MockEntity {
        const entity = new MockEntity();
        entity.name = name;
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
        it('should connect to db, start transaction, create and save the entity, commit the transaction, release the connection and return the value', async () => {
            const expectedEntityId = 123;
            const entity = TestHelper.mockRepositoryEntity('entity-1');

            const dataSourceCreateQueryRunnerConnectMethod = jest.spyOn(dataSource.createQueryRunner(), 'connect');
            const dataSourceCreateQueryRunnerStartTransactionMethod = jest.spyOn(
                dataSource.createQueryRunner(),
                'startTransaction',
            );
            const dataSourceCreateQueryRunnerManagerCreateMethod = jest
                .spyOn(dataSource.createQueryRunner().manager, 'create')
                .mockImplementation(() => {
                    return {
                        ...entity,
                        id: expectedEntityId,
                    } as unknown as [MockEntity]; // Fake the return type
                });
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

            const result = await service.create(entity);

            expect(dataSourceCreateQueryRunnerConnectMethod).toHaveBeenCalledTimes(1);
            expect(dataSourceCreateQueryRunnerStartTransactionMethod).toHaveBeenCalledTimes(1);
            expect(dataSourceCreateQueryRunnerManagerCreateMethod).toHaveBeenCalledWith(MockEntity, entity);
            expect(dataSourceCreateQueryRunnerManagerSaveMethod).toHaveBeenCalledWith({
                id: expectedEntityId,
                name: entity.name,
            });
            expect(dataSourceCreateQueryRunnerCommitTransactionMethod).toHaveBeenCalledTimes(1);
            expect(dataSourceCreateQueryRunnerRollbackTransactionMethod).not.toHaveBeenCalled();
            expect(dataSourceCreateQueryRunnerReleaseMethod).toHaveBeenCalledTimes(1);
            expect(result).toStrictEqual({
                id: expectedEntityId,
                name: entity.name,
            });
        });

        it('should connect to db, start transaction, rollback the transaction and release the connection when an error occurs on saving or commiting the db operation', async () => {
            const expectedEntityId = 123;
            const entity = TestHelper.mockRepositoryEntity('entity-1');
            const error = new Error('Error 123');

            const dataSourceCreateQueryRunnerConnectMethod = jest.spyOn(dataSource.createQueryRunner(), 'connect');
            const dataSourceCreateQueryRunnerStartTransactionMethod = jest.spyOn(
                dataSource.createQueryRunner(),
                'startTransaction',
            );
            const dataSourceCreateQueryRunnerManagerCreateMethod = jest
                .spyOn(dataSource.createQueryRunner().manager, 'create')
                .mockImplementation(() => {
                    return {
                        ...entity,
                        id: expectedEntityId,
                    } as unknown as [MockEntity]; // Fake the return type
                });
            const dataSourceCreateQueryRunnerManagerSaveMethod = jest
                .spyOn(dataSource.createQueryRunner().manager, 'save')
                .mockImplementation(() => {
                    throw error;
                });
            const dataSourceCreateQueryRunnerCommitTransactionMethod = jest.spyOn(
                dataSource.createQueryRunner(),
                'commitTransaction',
            );
            const dataSourceCreateQueryRunnerRollbackTransactionMethod = jest.spyOn(
                dataSource.createQueryRunner(),
                'rollbackTransaction',
            );
            const dataSourceCreateQueryRunnerReleaseMethod = jest.spyOn(dataSource.createQueryRunner(), 'release');

            await expect(service.create(entity)).rejects.toThrow(error);

            expect(dataSourceCreateQueryRunnerConnectMethod).toHaveBeenCalledTimes(1);
            expect(dataSourceCreateQueryRunnerStartTransactionMethod).toHaveBeenCalledTimes(1);
            expect(dataSourceCreateQueryRunnerManagerCreateMethod).toHaveBeenCalledWith(MockEntity, entity);
            expect(dataSourceCreateQueryRunnerManagerSaveMethod).toHaveBeenCalledWith({
                id: expectedEntityId,
                name: entity.name,
            });
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
            create: jest.fn(),
            save: jest.fn(),
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
    });

    return dataSource;
}
