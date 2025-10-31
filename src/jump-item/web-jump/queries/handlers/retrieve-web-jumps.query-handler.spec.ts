import { In } from 'typeorm';
import { JumpGroupType } from '../../enums';
import { WebJumpEntity } from '../../repositories/entities';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { RetrieveWebJumpsQuery } from '../retrieve-web-jumps.query';
import { RetrieveWebJumpsQueryHandler } from './retrieve-web-jumps.query-handler';

describe('RetrieveWebJumpsQueryHandler', () => {
    let webJumpRepositoryService: WebJumpRepositoryService;
    let handler: RetrieveWebJumpsQueryHandler;

    beforeEach(() => {
        webJumpRepositoryService = mockWebJumpRepositoryService();
        handler = new RetrieveWebJumpsQueryHandler(webJumpRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedWebJumps = [] as WebJumpEntity[];
            const webJumpRepositoryServiceFindByMethod = jest
                .spyOn(webJumpRepositoryService, 'findBy')
                .mockResolvedValue(expectedWebJumps);

            const result = await handler.execute(new RetrieveWebJumpsQuery('transaction-1', 123, 20, 2));

            expect(result).toBe(expectedWebJumps);
            expect(webJumpRepositoryServiceFindByMethod).toHaveBeenCalledWith(123, {}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedWebJumps = [] as WebJumpEntity[];
            const webJumpRepositoryServiceFindByMethod = jest
                .spyOn(webJumpRepositoryService, 'findBy')
                .mockResolvedValue(expectedWebJumps);

            const result = await handler.execute(
                new RetrieveWebJumpsQuery(
                    'transaction-2',
                    123,
                    10,
                    1,
                    'web-jump-1',
                    'url-1',
                    [2],
                    JumpGroupType.Personal,
                    3,
                    'tag-1',
                ),
            );

            expect(result).toBe(expectedWebJumps);
            expect(webJumpRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                123,
                {
                    name: 'web-jump-1',
                    url: 'url-1',
                    jumpGroupId: In([2]),
                    jumpGroupType: JumpGroupType.Personal,
                    jumpointId: 3,
                    tag: 'tag-1',
                },
                1,
                10,
            );
        });
    });
});

function mockWebJumpRepositoryService() {
    const service = {} as WebJumpRepositoryService;
    service.findBy = jest.fn();

    return service;
}
