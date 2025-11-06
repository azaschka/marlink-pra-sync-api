import { NotFoundException } from '@nestjs/common';
import { DateUtility } from '../../../shared/utilities';
import { User } from '../../models';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { MarkUserAsSyncedCommand } from '../mark-user-as-synced.command';
import { MarkUserAsSyncedCommandHandler } from './mark-user-as-synced.command-handler';

describe('MarkUserAsSyncedCommandHandler', () => {
    let userRepositoryService: UserRepositoryService;
    let handler: MarkUserAsSyncedCommandHandler;

    beforeEach(() => {
        userRepositoryService = mockUserRepositoryService();
        handler = new MarkUserAsSyncedCommandHandler(userRepositoryService);
    });

    it('should throw NotFoundException when not found', async () => {
        jest.spyOn(userRepositoryService, 'findOneById').mockReturnValue(Promise.resolve(null));

        await expect(handler.execute(new MarkUserAsSyncedCommand('transaction-1', 1, 2))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should modify the last sync date', async () => {
        const repoCreateOrUpdateByIdMethod = jest.spyOn(userRepositoryService, 'createOrUpdateById');
        DateUtility.getCurrentUtcDate = jest.fn().mockReturnValue(new Date('2025-10-10'));

        await handler.execute(new MarkUserAsSyncedCommand('transaction-1', 1, 2));

        expect(repoCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                id: 2,
                lastSyncDate: new Date('2025-10-10'),
            }),
        );
    });
});

function mockUserRepositoryService(): UserRepositoryService {
    const service = {} as UserRepositoryService;
    service.findOneById = jest.fn().mockReturnValue(Promise.resolve({ id: 2 } as User));
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
