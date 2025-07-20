import { BeyondtrustInstanceBackupEntity } from '../../repositories/entities';
import { BeyondtrustInstanceBackupRepositoryService } from '../../repositories/services/beyondtrust-instance-backup-repository.service';
import { RetrieveBeyondtrustInstanceBackupsQuery } from '../retrieve-beyondtrust-instance-backups.query';
import { RetrieveBeyondtrustInstanceBackupsQueryHandler } from './retrieve-beyondtrust-instance-backups.query-handler';

describe('RetrieveBeyondtrustInstanceBackupsQueryHandler', () => {
    let beyondtrustInstanceBackupRepositoryService: BeyondtrustInstanceBackupRepositoryService;
    let handler: RetrieveBeyondtrustInstanceBackupsQueryHandler;

    beforeEach(() => {
        beyondtrustInstanceBackupRepositoryService = mockBeyondtrustInstanceBackupRepositoryService();
        handler = new RetrieveBeyondtrustInstanceBackupsQueryHandler(beyondtrustInstanceBackupRepositoryService);
    });

    describe('execute', () => {
        it('should call the repo with correct parameter and return value from the repo', async () => {
            const expectedBeyondtrustInstanceBackups = [] as BeyondtrustInstanceBackupEntity[];
            const beyondtrustInstanceBackupRepositoryServiceFindByMethod = jest
                .spyOn(beyondtrustInstanceBackupRepositoryService, 'findBy')
                .mockResolvedValue(expectedBeyondtrustInstanceBackups);

            const result = await handler.execute(
                new RetrieveBeyondtrustInstanceBackupsQuery('transaction-2', 10, 1, 123),
            );

            expect(result).toBe(expectedBeyondtrustInstanceBackups);
            expect(beyondtrustInstanceBackupRepositoryServiceFindByMethod).toHaveBeenCalledWith(
                {
                    beyondtrustInstanceId: 123,
                },
                1,
                10,
            );
        });
    });
});

function mockBeyondtrustInstanceBackupRepositoryService() {
    const service = {} as BeyondtrustInstanceBackupRepositoryService;
    service.findBy = jest.fn();

    return service;
}
