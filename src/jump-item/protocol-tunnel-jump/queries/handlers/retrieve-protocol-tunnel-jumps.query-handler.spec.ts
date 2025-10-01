import { JumpGroupType } from '../../enums';
import { ProtocolTunnelJumpEntity } from '../../repositories/entities';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { RetrieveProtocolTunnelJumpsQuery } from '../retrieve-protocol-tunnel-jumps.query';
import { RetrieveProtocolTunnelJumpsQueryHandler } from './retrieve-protocol-tunnel-jumps.query-handler';

describe('RetrieveProtocolTunnelJumpsQueryHandler', () => {
    let protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService;
    let handler: RetrieveProtocolTunnelJumpsQueryHandler;

    beforeEach(() => {
        protocolTunnelJumpRepositoryService = mockProtocolTunnelJumpRepositoryService();
        handler = new RetrieveProtocolTunnelJumpsQueryHandler(protocolTunnelJumpRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with page size and page number; and return value from the repo', async () => {
            const expectedProtocolTunnelJumps = [] as ProtocolTunnelJumpEntity[];
            const protocolTunnelJumpRepositoryServiceFindByMethod = jest
                .spyOn(protocolTunnelJumpRepositoryService, 'findBy')
                .mockResolvedValue(expectedProtocolTunnelJumps);

            const result = await handler.execute(new RetrieveProtocolTunnelJumpsQuery('transaction-1', 123, 20, 2));

            expect(result).toBe(expectedProtocolTunnelJumps);
            expect(protocolTunnelJumpRepositoryServiceFindByMethod).toHaveBeenCalledWith(123, {}, 2, 20);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedProtocolTunnelJumps = [] as ProtocolTunnelJumpEntity[];
            const protocolTunnelJumpRepositoryServiceFindByMethod = jest
                .spyOn(protocolTunnelJumpRepositoryService, 'findBy')
                .mockResolvedValue(expectedProtocolTunnelJumps);

            const result = await handler.execute(
                new RetrieveProtocolTunnelJumpsQuery(
                    'transaction-2',
                    123,
                    10,
                    1,
                    'protocol-tunnel-jump-1',
                    'host-1',
                    2,
                    JumpGroupType.Personal,
                    3,
                    'tag-1',
                ),
            );

            expect(result).toBe(expectedProtocolTunnelJumps);
            expect(protocolTunnelJumpRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                123,
                {
                    name: 'protocol-tunnel-jump-1',
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

function mockProtocolTunnelJumpRepositoryService() {
    const service = {} as ProtocolTunnelJumpRepositoryService;
    service.findBy = jest.fn();

    return service;
}
