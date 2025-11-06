import { NotFoundException } from '@nestjs/common';
import { JumpClientInstallerEntity } from '../../repositories/entities';
import { JumpClientInstallerRepositoryService } from '../../repositories/services/jump-client-installer-repository.service';
import { RetrieveJumpClientInstallerByIdQuery } from '../retrieve-jump-client-installer-by-id.query';
import { RetrieveJumpClientInstallerByIdQueryHandler } from './retrieve-jump-client-installer-by-id.query-handler';

describe('RetrieveJumpClientInstallerByIdQueryHandler', () => {
    let jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService;
    let handler: RetrieveJumpClientInstallerByIdQueryHandler;

    beforeEach(() => {
        jumpClientInstallerRepositoryService = mockJumpClientInstallerRepositoryService();
        handler = new RetrieveJumpClientInstallerByIdQueryHandler(jumpClientInstallerRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException when repo returns null', async () => {
            jest.spyOn(jumpClientInstallerRepositoryService, 'findOneById').mockResolvedValue(null);

            await expect(
                handler.execute(new RetrieveJumpClientInstallerByIdQuery('transaction-1', 1, 123)),
            ).rejects.toThrow(NotFoundException);
        });

        it('should return value from the repo', async () => {
            const expectedJumpClientInstaller = { id: 123 } as JumpClientInstallerEntity;
            const jumpClientInstallerRepositoryServiceFindOneByIdMethod = jest
                .spyOn(jumpClientInstallerRepositoryService, 'findOneById')
                .mockResolvedValue(expectedJumpClientInstaller);

            const result = await handler.execute(new RetrieveJumpClientInstallerByIdQuery('transaction-1', 1, 123));

            expect(result).toBe(expectedJumpClientInstaller);
            expect(jumpClientInstallerRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(1, 123);
        });
    });
});

function mockJumpClientInstallerRepositoryService() {
    const service = {} as JumpClientInstallerRepositoryService;
    service.findOneById = jest.fn();

    return service;
}
