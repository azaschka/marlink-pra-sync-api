import { In } from 'typeorm';
import { JumpGroupType } from '../../enums';
import { RemoteRdpEntity } from '../../repositories/entities';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { RetrieveRemoteRdpsQuery } from '../retrieve-remote-rdps.query';
import { RetrieveRemoteRdpsQueryHandler } from './retrieve-remote-rdps.query-handler';

describe('RetrieveRemoteRdpsQueryHandler', () => {
    let remoteRdpRepositoryService: RemoteRdpRepositoryService;
    let handler: RetrieveRemoteRdpsQueryHandler;

    beforeEach(() => {
        remoteRdpRepositoryService = mockRemoteRdpRepositoryService();
        handler = new RetrieveRemoteRdpsQueryHandler(remoteRdpRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedRemoteRdps = [] as RemoteRdpEntity[];
            const remoteRdpRepositoryServiceFindByMethod = jest
                .spyOn(remoteRdpRepositoryService, 'findBy')
                .mockResolvedValue(expectedRemoteRdps);

            const result = await handler.execute(new RetrieveRemoteRdpsQuery('transaction-1', 123, 20, 2));

            expect(result).toBe(expectedRemoteRdps);
            expect(remoteRdpRepositoryServiceFindByMethod).toHaveBeenCalledWith(123, {}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedRemoteRdps = [] as RemoteRdpEntity[];
            const remoteRdpRepositoryServiceFindByMethod = jest
                .spyOn(remoteRdpRepositoryService, 'findBy')
                .mockResolvedValue(expectedRemoteRdps);

            const result = await handler.execute(
                new RetrieveRemoteRdpsQuery(
                    'transaction-2',
                    123,
                    10,
                    1,
                    'remote-rdp-1',
                    'host-1',
                    [2],
                    JumpGroupType.Personal,
                    3,
                    4,
                    'tag-1',
                ),
            );

            expect(result).toBe(expectedRemoteRdps);
            expect(remoteRdpRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                123,
                {
                    name: 'remote-rdp-1',
                    hostname: 'host-1',
                    jumpGroupId: In([2]),
                    jumpGroupType: JumpGroupType.Personal,
                    jumpointId: 3,
                    endpointId: 4,
                    tag: 'tag-1',
                },
                1,
                10,
            );
        });
    });
});

function mockRemoteRdpRepositoryService() {
    const service = {} as RemoteRdpRepositoryService;
    service.findBy = jest.fn();

    return service;
}
