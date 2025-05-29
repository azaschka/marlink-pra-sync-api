import { Jumpoint } from '../../models';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { RetrieveJumpointsQuery } from '../retrieve-jumpoints.query';
import { RetrieveJumpointsQueryHandler } from './retrieve-jumpoints.query-handler';

describe('RetrieveJumpointsQueryHandler', () => {
    let jumpointRepositoryService: JumpointRepositoryService;
    let handler: RetrieveJumpointsQueryHandler;

    beforeEach(() => {
        jumpointRepositoryService = mockJumpointRepositoryService();
        handler = new RetrieveJumpointsQueryHandler(jumpointRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedJumpoints = [] as Jumpoint[];
            const jumpointRepositoryServiceFindByMethod = jest
                .spyOn(jumpointRepositoryService, 'findBy')
                .mockResolvedValue(expectedJumpoints);

            const result = await handler.execute(new RetrieveJumpointsQuery('transaction-1', 20, 2));

            expect(result).toBe(expectedJumpoints);
            expect(jumpointRepositoryServiceFindByMethod).toHaveBeenCalledWith({}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedJumpoints = [] as Jumpoint[];
            const jumpointRepositoryServiceFindByMethod = jest
                .spyOn(jumpointRepositoryService, 'findBy')
                .mockResolvedValue(expectedJumpoints);

            const result = await handler.execute(
                new RetrieveJumpointsQuery(
                    'transaction-2',
                    10,
                    1,
                    'Jumpoint 1',
                    'public-ip-1',
                    'private-ip-1',
                    'hostname-1',
                    'code-name-1',
                ),
            );

            expect(result).toBe(expectedJumpoints);
            expect(jumpointRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                {
                    name: 'Jumpoint 1',
                    publicIp: undefined,
                    privateIp: undefined,
                    hostname: undefined,
                    codeName: 'code-name-1',
                },
                1,
                10,
            );
        });
    });
});

function mockJumpointRepositoryService() {
    const service = {} as JumpointRepositoryService;
    service.findBy = jest.fn();

    return service;
}
