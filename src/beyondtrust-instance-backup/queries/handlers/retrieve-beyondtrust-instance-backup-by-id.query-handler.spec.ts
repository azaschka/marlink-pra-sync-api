import { NotFoundException } from '@nestjs/common';
import { BeyondtrustInstanceBackupEntity } from '../../repositories/entities';
import { BeyondtrustInstanceBackupRepositoryService } from '../../repositories/services/beyondtrust-instance-backup-repository.service';
import { RetrieveBeyondtrustInstanceBackupByIdQuery } from '../retrieve-beyondtrust-instance-backup-by-id.query';
import { RetrieveBeyondtrustInstanceBackupByIdQueryHandler } from './retrieve-beyondtrust-instance-backup-by-id.query-handler';

describe('RetrieveBeyondtrustInstanceBackupByIdQueryHandler', () => {
    let beyondtrustInstanceBackupRepositoryService: BeyondtrustInstanceBackupRepositoryService;
    let handler: RetrieveBeyondtrustInstanceBackupByIdQueryHandler;

    beforeEach(() => {
        beyondtrustInstanceBackupRepositoryService = mockBeyondtrustInstanceBackupRepositoryService();
        handler = new RetrieveBeyondtrustInstanceBackupByIdQueryHandler(beyondtrustInstanceBackupRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException if beyondtrustInstanceBackup is not found', async () => {
            jest.spyOn(beyondtrustInstanceBackupRepositoryService, 'findOneBy').mockResolvedValue(null);

            await expect(
                handler.execute(new RetrieveBeyondtrustInstanceBackupByIdQuery('transaction-1', 123, 456)),
            ).rejects.toThrow(NotFoundException);
        });

        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedBeyondtrustInstanceBackup = { id: 456 } as BeyondtrustInstanceBackupEntity;
            const beyondtrustInstanceBackupRepositoryServiceFindOneByMethod = jest
                .spyOn(beyondtrustInstanceBackupRepositoryService, 'findOneBy')
                .mockResolvedValue(expectedBeyondtrustInstanceBackup);

            const result = await handler.execute(
                new RetrieveBeyondtrustInstanceBackupByIdQuery('transaction-2', 123, 456),
            );

            expect(result).toBe(expectedBeyondtrustInstanceBackup);
            expect(beyondtrustInstanceBackupRepositoryServiceFindOneByMethod).toHaveBeenCalledWith({
                beyondtrustInstanceId: 123,
                id: 456,
            });
        });
    });
});

function mockBeyondtrustInstanceBackupRepositoryService() {
    const service = {} as BeyondtrustInstanceBackupRepositoryService;
    service.findOneBy = jest.fn();

    return service;
}
