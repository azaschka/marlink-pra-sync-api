import { DataSource } from 'typeorm';
import { GroupPolicyEntity } from '../entities';
import { GroupPolicyRepositoryService } from './group-policy-repository.service';

// Mock BaseRepositoryService
const baseRepositoryCreateMethod = jest.fn();
jest.mock('../../../core/services/base-repository.service', () => {
    return {
        BaseRepositoryService: jest.fn().mockImplementation(() => {
            return {
                create: baseRepositoryCreateMethod,
            };
        }),
    };
});

describe('GroupPolicyRepositoryService', () => {
    let service: GroupPolicyRepositoryService;
    let dataSource: DataSource;

    beforeEach(() => {
        dataSource = {} as DataSource;
        service = new GroupPolicyRepositoryService(dataSource);
    });

    describe('create', () => {
        it('should call create method from the base class', async () => {
            const entity = {} as GroupPolicyEntity;

            await service.create(entity);

            expect(baseRepositoryCreateMethod).toHaveBeenCalledWith(entity);
        });
    });
});
