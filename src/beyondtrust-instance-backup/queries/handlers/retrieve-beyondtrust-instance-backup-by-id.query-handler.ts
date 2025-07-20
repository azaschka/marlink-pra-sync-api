import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BeyondtrustInstanceBackup } from '../../models';
import { BeyondtrustInstanceBackupRepositoryService } from '../../repositories/services/beyondtrust-instance-backup-repository.service';
import { RetrieveBeyondtrustInstanceBackupByIdQuery } from '../retrieve-beyondtrust-instance-backup-by-id.query';

@QueryHandler(RetrieveBeyondtrustInstanceBackupByIdQuery)
export class RetrieveBeyondtrustInstanceBackupByIdQueryHandler
    implements IQueryHandler<RetrieveBeyondtrustInstanceBackupByIdQuery>
{
    constructor(
        private readonly beyondtrustInstanceBackupRepositoryService: BeyondtrustInstanceBackupRepositoryService,
    ) {}

    public async execute(query: RetrieveBeyondtrustInstanceBackupByIdQuery): Promise<BeyondtrustInstanceBackup> {
        const beyondtrustInstanceBackupFindByQuery = <BeyondtrustInstanceBackup>{};
        beyondtrustInstanceBackupFindByQuery.beyondtrustInstanceId = query.beyondtrustInstanceId;
        beyondtrustInstanceBackupFindByQuery.id = query.id;

        const beyondtrustInstanceBackup = await this.beyondtrustInstanceBackupRepositoryService.findOneBy(
            beyondtrustInstanceBackupFindByQuery,
        );

        if (!beyondtrustInstanceBackup) {
            throw new NotFoundException(
                `Beyondtrust instance backup with ID ${query.id} not found for instance ID ${query.beyondtrustInstanceId}.`,
            );
        }

        return beyondtrustInstanceBackup;
    }
}
