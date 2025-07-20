import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BeyondtrustInstanceBackup } from '../../models';
import { BeyondtrustInstanceBackupRepositoryService } from '../../repositories/services/beyondtrust-instance-backup-repository.service';
import { RetrieveBeyondtrustInstanceBackupsQuery } from '../retrieve-beyondtrust-instance-backups.query';

@QueryHandler(RetrieveBeyondtrustInstanceBackupsQuery)
export class RetrieveBeyondtrustInstanceBackupsQueryHandler
    implements IQueryHandler<RetrieveBeyondtrustInstanceBackupsQuery>
{
    constructor(
        private readonly beyondtrustInstanceBackupRepositoryService: BeyondtrustInstanceBackupRepositoryService,
    ) {}

    public async execute(query: RetrieveBeyondtrustInstanceBackupsQuery): Promise<BeyondtrustInstanceBackup[]> {
        const beyondtrustInstanceBackupFindByQuery = <BeyondtrustInstanceBackup>{};
        beyondtrustInstanceBackupFindByQuery.beyondtrustInstanceId = query.beyondtrustInstanceId;

        const beyondtrustInstanceBackups = await this.beyondtrustInstanceBackupRepositoryService.findBy(
            beyondtrustInstanceBackupFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return beyondtrustInstanceBackups;
    }
}
