import { BeyondtrustInstanceEntity } from '../../repositories/entities';
import { BeyondtrustInstanceRepositoryService } from '../../repositories/services/beyondtrust-instance-repository.service';
import { RetrieveBeyondtrustInstancesQuery } from '../retrieve-beyondtrust-instances.query';
import { RetrieveBeyondtrustInstancesQueryHandler } from './retrieve-beyondtrust-instances.query-handler';

describe('RetrieveBeyondtrustInstancesQueryHandler', () => {
    let beyondtrustInstanceRepositoryService: BeyondtrustInstanceRepositoryService;
    let handler: RetrieveBeyondtrustInstancesQueryHandler;

    beforeEach(() => {
        beyondtrustInstanceRepositoryService = mockBeyondtrustInstanceRepositoryService();
        handler = new RetrieveBeyondtrustInstancesQueryHandler(beyondtrustInstanceRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedBeyondtrustInstances = [] as BeyondtrustInstanceEntity[];
            const beyondtrustInstanceRepositoryServiceFindByMethod = jest
                .spyOn(beyondtrustInstanceRepositoryService, 'findBy')
                .mockResolvedValue(expectedBeyondtrustInstances);

            const result = await handler.execute(new RetrieveBeyondtrustInstancesQuery('transaction-1', 20, 2));

            expect(result).toBe(expectedBeyondtrustInstances);
            expect(beyondtrustInstanceRepositoryServiceFindByMethod).toHaveBeenCalledWith({}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedBeyondtrustInstances = [] as BeyondtrustInstanceEntity[];
            const beyondtrustInstanceRepositoryServiceFindByMethod = jest
                .spyOn(beyondtrustInstanceRepositoryService, 'findBy')
                .mockResolvedValue(expectedBeyondtrustInstances);

            const result = await handler.execute(
                new RetrieveBeyondtrustInstancesQuery(
                    'transaction-2',
                    10,
                    1,
                    'beyondtrust-instance-1',
                    'oauth2-token-url-1',
                    'api-base-url-1',
                ),
            );

            expect(result).toBe(expectedBeyondtrustInstances);
            expect(beyondtrustInstanceRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                {
                    name: 'beyondtrust-instance-1',
                    oauth2TokenUrl: 'oauth2-token-url-1',
                    apiBaseUrl: 'api-base-url-1',
                },
                1,
                10,
            );
        });
    });
});

function mockBeyondtrustInstanceRepositoryService() {
    const service = {} as BeyondtrustInstanceRepositoryService;
    service.findBy = jest.fn();

    return service;
}
