import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../shared/utilities';
import { BeyondtrustInstanceBackupContent } from '../../models';
import { BeyondtrustInstanceBackupRepositoryService } from '../../repositories/services/beyondtrust-instance-backup-repository.service';
import { RetrieveBeyondtrustInstanceBackupContentQuery } from '../retrieve-beyondtrust-instance-backup-content.query';

@QueryHandler(RetrieveBeyondtrustInstanceBackupContentQuery)
export class RetrieveBeyondtrustInstanceBackupContentQueryHandler
    implements IQueryHandler<RetrieveBeyondtrustInstanceBackupContentQuery>
{
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly beyondtrustInstanceBackupRepositoryService: BeyondtrustInstanceBackupRepositoryService,
    ) {}

    public async execute(
        query: RetrieveBeyondtrustInstanceBackupContentQuery,
    ): Promise<BeyondtrustInstanceBackupContent> {
        const backup = await this.beyondtrustInstanceBackupRepositoryService.findOneBy({
            beyondtrustInstanceId: query.beyondtrustInstanceId,
            id: query.id,
        });

        if (!backup) {
            throw new NotFoundException(
                `Backup with ID ${query.id} not found for Beyondtrust instance ${query.beyondtrustInstanceId}.`,
            );
        }

        const absoluteFilePath = UrlUtility.join(this.appConfigService.storage.rootPath, backup.backupFilePath);

        if (!this.doesBackupFileExist(absoluteFilePath)) {
            throw new NotFoundException(`Backup file not found.`);
        }

        const fileBuffer = await this.readBackupFile(absoluteFilePath);

        return {
            filename: path.basename(absoluteFilePath),
            buffer: fileBuffer,
        };
    }

    private doesBackupFileExist(absoluteFilePath: string): boolean {
        return fs.existsSync(absoluteFilePath);
    }

    private readBackupFile(absoluteFilePath: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            fs.readFile(absoluteFilePath, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }
}
