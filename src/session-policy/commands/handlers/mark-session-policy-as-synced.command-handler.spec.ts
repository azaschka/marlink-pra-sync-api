import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { SessionPolicy } from '../../models';
import { SessionPolicyRepositoryService } from '../../repositories/services/session-policy-repository.service';
import { MarkSessionPolicyAsSyncedCommand } from '../mark-session-policy-as-synced.command';
import { MarkSessionPolicyAsSyncedCommandHandler } from './mark-session-policy-as-synced.command-handler';

describe('MarkSessionPolicyAsSyncedCommandHandler', () => {
    let sessionPolicyRepositoryService: SessionPolicyRepositoryService;
    let handler: MarkSessionPolicyAsSyncedCommandHandler;
    beforeEach(() => {
        sessionPolicyRepositoryService = mockSessionPolicyRepositoryService();
        handler = new MarkSessionPolicyAsSyncedCommandHandler(sessionPolicyRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(sessionPolicyRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkSessionPolicyAsSyncedCommand('transaction-1', 1, 2))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(sessionPolicyRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkSessionPolicyAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockSessionPolicyRepositoryService(): SessionPolicyRepositoryService {
    const service = {} as SessionPolicyRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as SessionPolicy));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
