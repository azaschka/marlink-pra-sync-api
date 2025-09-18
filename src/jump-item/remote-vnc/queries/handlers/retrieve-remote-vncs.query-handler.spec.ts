import { JumpGroupType } from '../../enums';
import { RemoteVncEntity } from '../../repositories/entities';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { RetrieveRemoteVncsQuery } from '../retrieve-remote-vncs.query';
import { RetrieveRemoteVncsQueryHandler } from './retrieve-remote-vncs.query-handler';

describe('RetrieveRemoteVncsQueryHandler', () => {
    let remoteVncRepositoryService: RemoteVncRepositoryService;
    let handler: RetrieveRemoteVncsQueryHandler;

    beforeEach(() => {
        remoteVncRepositoryService = mockRemoteVncRepositoryService();
        handler = new RetrieveRemoteVncsQueryHandler(remoteVncRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedRemoteVncs = [] as RemoteVncEntity[];
            const remoteVncRepositoryServiceFindByMethod = jest
                .spyOn(remoteVncRepositoryService, 'findBy')
                .mockResolvedValue(expectedRemoteVncs);

            const result = await handler.execute(new RetrieveRemoteVncsQuery('transaction-1', 123, 20, 2));

            expect(result).toBe(expectedRemoteVncs);
            expect(remoteVncRepositoryServiceFindByMethod).toHaveBeenCalledWith(123, {}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedRemoteVncs = [] as RemoteVncEntity[];
            const remoteVncRepositoryServiceFindByMethod = jest
                .spyOn(remoteVncRepositoryService, 'findBy')
                .mockResolvedValue(expectedRemoteVncs);

            const result = await handler.execute(
                new RetrieveRemoteVncsQuery(
                    'transaction-2',
                    123,
                    10,
                    1,
                    'remote-vnc-1',
                    'host-1',
                    2,
                    JumpGroupType.Personal,
                    3,
                    'tag-1',
                ),
            );

            expect(result).toBe(expectedRemoteVncs);
            expect(remoteVncRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                123,
                {
                    name: 'remote-vnc-1',
                    hostname: 'host-1',
                    jumpGroupId: 2,
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

function mockRemoteVncRepositoryService() {
    const service = {} as RemoteVncRepositoryService;
    service.findBy = jest.fn();

    return service;
}
