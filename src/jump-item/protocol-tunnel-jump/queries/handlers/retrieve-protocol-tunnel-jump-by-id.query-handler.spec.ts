import { NotFoundException } from '@nestjs/common';
import { ProtocolTunnelJumpEntity } from '../../repositories/entities';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { RetrieveProtocolTunnelJumpByIdQuery } from '../retrieve-protocol-tunnel-jump-by-id.query';
import { RetrieveProtocolTunnelJumpByIdQueryHandler } from './retrieve-protocol-tunnel-jump-by-id.query-handler';

describe('RetrieveProtocolTunnelJumpByIdQueryHandler', () => {
    let protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService;
    let handler: RetrieveProtocolTunnelJumpByIdQueryHandler;

    beforeEach(() => {
        protocolTunnelJumpRepositoryService = mockProtocolTunnelJumpRepositoryService();
        handler = new RetrieveProtocolTunnelJumpByIdQueryHandler(protocolTunnelJumpRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(protocolTunnelJumpRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(
                handler.execute(new RetrieveProtocolTunnelJumpByIdQuery('transaction-1', 1, 123)),
            ).rejects.toThrow(NotFoundException);
        });

        it('should return value from the repo', async () => {
            const expectedProtocolTunnelJump = { id: 123 } as ProtocolTunnelJumpEntity;
            const protocolTunnelJumpRepositoryServiceFindOneByIdMethod = jest
                .spyOn(protocolTunnelJumpRepositoryService, 'findOneById')
                .mockResolvedValue(expectedProtocolTunnelJump);

            const result = await handler.execute(new RetrieveProtocolTunnelJumpByIdQuery('transaction-1', 1, 123));

            expect(result).toBe(expectedProtocolTunnelJump);
            expect(protocolTunnelJumpRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(1, 123);
        });
    });
});

function mockProtocolTunnelJumpRepositoryService() {
    const service = {} as ProtocolTunnelJumpRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
