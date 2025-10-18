import { DiscrepancyEntityType } from '../../enums';
import { DiscrepancyEntity } from '../../repositories/entities';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { RetrieveDiscrepanciesQuery } from '../retrieve-discrepancies.query';
import { RetrieveDiscrepanciesQueryHandler } from './retrieve-discrepancies.query-handler';

describe('RetrieveDiscrepanciesQueryHandler', () => {
    let discrepancyRepositoryService: DiscrepancyRepositoryService;
    let handler: RetrieveDiscrepanciesQueryHandler;

    beforeEach(() => {
        discrepancyRepositoryService = mockSyncDiscrepancyRepositoryService();
        handler = new RetrieveDiscrepanciesQueryHandler(discrepancyRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedDiscrepancies = [] as DiscrepancyEntity[];
            const discrepancyRepositoryServiceFindByMethod = jest
                .spyOn(discrepancyRepositoryService, 'findBy')
                .mockResolvedValue(expectedDiscrepancies);

            const result = await handler.execute(new RetrieveDiscrepanciesQuery('transaction-1', 123, 20, 2));

            expect(result).toBe(expectedDiscrepancies);
            expect(discrepancyRepositoryServiceFindByMethod).toHaveBeenCalledWith(123, {}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedDiscrepancies = [] as DiscrepancyEntity[];
            const discrepancyRepositoryServiceFindByMethod = jest
                .spyOn(discrepancyRepositoryService, 'findBy')
                .mockResolvedValue(expectedDiscrepancies);

            const result = await handler.execute(
                new RetrieveDiscrepanciesQuery('transaction-2', 123, 10, 1, DiscrepancyEntityType.GroupPolicy, 100),
            );

            expect(result).toBe(expectedDiscrepancies);
            expect(discrepancyRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                123,
                {
                    entityType: DiscrepancyEntityType.GroupPolicy,
                    entityId: 100,
                },
                1,
                10,
            );
        });
    });
});

function mockSyncDiscrepancyRepositoryService() {
    const service = {} as DiscrepancyRepositoryService;
    service.findBy = jest.fn();

    return service;
}
