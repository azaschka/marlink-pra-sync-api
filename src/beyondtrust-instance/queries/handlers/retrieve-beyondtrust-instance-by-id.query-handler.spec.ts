import { BeyondtrustInstanceEntity } from '../../repositories/entities';
import { BeyondtrustInstanceRepositoryService } from '../../repositories/services/beyondtrust-instance-repository.service';
import { RetrieveBeyondtrustInstanceByIdQuery } from '../retrieve-beyondtrust-instance-by-id.query';
import { RetrieveBeyondtrustInstanceByIdQueryHandler } from './retrieve-beyondtrust-instance-by-id.query-handler';

describe('RetrieveBeyondtrustInstanceByIdQueryHandler', () => {
    let beyondtrustInstanceRepositoryService: BeyondtrustInstanceRepositoryService;
    let handler: RetrieveBeyondtrustInstanceByIdQueryHandler;

    beforeEach(() => {
        beyondtrustInstanceRepositoryService = mockBeyondtrustInstanceRepositoryService();
        handler = new RetrieveBeyondtrustInstanceByIdQueryHandler(beyondtrustInstanceRepositoryService);
    });

    describe('execute', () => {
        it('should return value from the repo', async () => {
            const expectedBeyondtrustInstance = { id: 123 } as BeyondtrustInstanceEntity;
            const beyondtrustInstanceRepositoryServiceFindOneByIdMethod = jest
                .spyOn(beyondtrustInstanceRepositoryService, 'findOneById')
                .mockResolvedValue(expectedBeyondtrustInstance);

            const result = await handler.execute(new RetrieveBeyondtrustInstanceByIdQuery('transaction-1', 123));

            expect(result).toBe(expectedBeyondtrustInstance);
            expect(beyondtrustInstanceRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(123);
        });
    });
});

function mockBeyondtrustInstanceRepositoryService() {
    const service = {} as BeyondtrustInstanceRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
