import { JumpGroupEntity } from '../../repositories/entities';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { RetrieveJumpGroupsQuery } from '../retrieve-jump-groups.query';
import { RetrieveJumpGroupsQueryHandler } from './retrieve-jump-groups.query-handler';

describe('RetrieveJumpGroupsQueryHandler', () => {
    let jumpGroupRepositoryService: JumpGroupRepositoryService;
    let handler: RetrieveJumpGroupsQueryHandler;

    beforeEach(() => {
        jumpGroupRepositoryService = mockJumpGroupRepositoryService();
        handler = new RetrieveJumpGroupsQueryHandler(jumpGroupRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedJumpGroups = [] as JumpGroupEntity[];
            const jumpGroupRepositoryServiceFindByMethod = jest
                .spyOn(jumpGroupRepositoryService, 'findBy')
                .mockResolvedValue(expectedJumpGroups);

            const result = await handler.execute(new RetrieveJumpGroupsQuery('transaction-1', 123, 20, 2));

            expect(result).toBe(expectedJumpGroups);
            expect(jumpGroupRepositoryServiceFindByMethod).toHaveBeenCalledWith(123, {}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedJumpGroups = [] as JumpGroupEntity[];
            const jumpGroupRepositoryServiceFindByMethod = jest
                .spyOn(jumpGroupRepositoryService, 'findBy')
                .mockResolvedValue(expectedJumpGroups);

            const result = await handler.execute(
                new RetrieveJumpGroupsQuery('transaction-2', 123, 10, 1, 'jump-group-1', 'jump-group-code-1'),
            );

            expect(result).toBe(expectedJumpGroups);
            expect(jumpGroupRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                123,
                { name: 'jump-group-1', codeName: 'jump-group-code-1' },
                1,
                10,
            );
        });
    });
});

function mockJumpGroupRepositoryService() {
    const service = {} as JumpGroupRepositoryService;
    service.findBy = jest.fn();

    return service;
}
