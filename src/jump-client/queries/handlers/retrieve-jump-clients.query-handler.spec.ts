import { JumpClientConnectionType, JumpClientGroupType } from '../../enums';
import { JumpClientEntity } from '../../repositories/entities';
import { JumpClientRepositoryService } from '../../repositories/services/jump-client-repository.service';
import { RetrieveJumpClientsQuery } from '../retrieve-jump-clients.query';
import { RetrieveJumpClientsQueryHandler } from './retrieve-jump-clients.query-handler';

describe('RetrieveJumpClientsQueryHandler', () => {
    let jumpClientRepositoryService: JumpClientRepositoryService;
    let handler: RetrieveJumpClientsQueryHandler;

    beforeEach(() => {
        jumpClientRepositoryService = mockJumpClientRepositoryService();
        handler = new RetrieveJumpClientsQueryHandler(jumpClientRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedJumpClients = [] as JumpClientEntity[];
            const jumpClientRepositoryServiceFindByMethod = jest
                .spyOn(jumpClientRepositoryService, 'findBy')
                .mockResolvedValue(expectedJumpClients);

            const result = await handler.execute(new RetrieveJumpClientsQuery('transaction-1', 123, 20, 2));

            expect(result).toBe(expectedJumpClients);
            expect(jumpClientRepositoryServiceFindByMethod).toHaveBeenCalledWith(123, {}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedJumpClients = [] as JumpClientEntity[];
            const jumpClientRepositoryServiceFindByMethod = jest
                .spyOn(jumpClientRepositoryService, 'findBy')
                .mockResolvedValue(expectedJumpClients);

            const result = await handler.execute(
                new RetrieveJumpClientsQuery(
                    'transaction-2',
                    100,
                    10,
                    1,
                    'jump-client-1',
                    'host-1',
                    'fqdn-1',
                    'tag-1',
                    123,
                    JumpClientGroupType.Personal,
                    'console-user-1',
                    'public-ip-1',
                    'private-ip-1',
                    JumpClientConnectionType.Active,
                ),
            );

            expect(result).toBe(expectedJumpClients);
            expect(jumpClientRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                100,
                {
                    name: 'jump-client-1',
                    hostname: 'host-1',
                    fqdn: 'fqdn-1',
                    tag: 'tag-1',
                    jumpGroupId: 123,
                    jumpGroupType: JumpClientGroupType.Personal,
                    consoleUser: 'console-user-1',
                    publicIp: 'public-ip-1',
                    privateIp: 'private-ip-1',
                    connectionType: JumpClientConnectionType.Active,
                },
                1,
                10,
            );
        });
    });
});

function mockJumpClientRepositoryService() {
    const service = {} as JumpClientRepositoryService;
    service.findBy = jest.fn();

    return service;
}
