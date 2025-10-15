import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../../shared/utilities';
import { ProtocolTunnelJump } from '../../models';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { MarkProtocolTunnelJumpAsSyncedCommand } from '../mark-protocol-tunnel-jump-as-synced.command';
import { MarkProtocolTunnelJumpAsSyncedCommandHandler } from './mark-protocol-tunnel-jump-as-synced.command-handler';

describe('MarkProtocolTunnelJumpAsSyncedCommandHandler', () => {
    let protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService;
    let handler: MarkProtocolTunnelJumpAsSyncedCommandHandler;

    beforeEach(() => {
        protocolTunnelJumpRepositoryService = mockProtocolTunnelJumpRepositoryService();
        handler = new MarkProtocolTunnelJumpAsSyncedCommandHandler(protocolTunnelJumpRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(protocolTunnelJumpRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkProtocolTunnelJumpAsSyncedCommand('transaction-1', 1, 2))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(protocolTunnelJumpRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkProtocolTunnelJumpAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockProtocolTunnelJumpRepositoryService(): ProtocolTunnelJumpRepositoryService {
    const service = {} as ProtocolTunnelJumpRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as ProtocolTunnelJump));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
