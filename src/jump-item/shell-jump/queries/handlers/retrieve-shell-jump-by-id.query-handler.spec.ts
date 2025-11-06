import { NotFoundException } from '@nestjs/common';
import { ShellJumpEntity } from '../../repositories/entities';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { RetrieveShellJumpByIdQuery } from '../retrieve-shell-jump-by-id.query';
import { RetrieveShellJumpByIdQueryHandler } from './retrieve-shell-jump-by-id.query-handler';

describe('RetrieveShellJumpByIdQueryHandler', () => {
    let shellJumpRepositoryService: ShellJumpRepositoryService;
    let handler: RetrieveShellJumpByIdQueryHandler;

    beforeEach(() => {
        shellJumpRepositoryService = mockShellJumpRepositoryService();
        handler = new RetrieveShellJumpByIdQueryHandler(shellJumpRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(shellJumpRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(handler.execute(new RetrieveShellJumpByIdQuery('transaction-1', 1, 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should return value from the repo', async () => {
            const expectedShellJump = { id: 123 } as ShellJumpEntity;
            const shellJumpRepositoryServiceFindOneByIdMethod = jest
                .spyOn(shellJumpRepositoryService, 'findOneById')
                .mockResolvedValue(expectedShellJump);

            const result = await handler.execute(new RetrieveShellJumpByIdQuery('transaction-1', 1, 123));

            expect(result).toBe(expectedShellJump);
            expect(shellJumpRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(1, 123);
        });
    });
});

function mockShellJumpRepositoryService() {
    const service = {} as ShellJumpRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
