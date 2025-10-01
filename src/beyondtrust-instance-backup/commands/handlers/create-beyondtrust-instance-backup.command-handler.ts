import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { BeyondtrustInstance } from '../../../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstanceByIdQuery } from '../../../beyondtrust-instance/queries';
import { CreateBackupCommand } from '../../../beyondtrust-pra-conf-api/backup/commands';
import { ErrorProcessorUtility, UrlUtility } from '../../../shared/utilities';
import { BeyondtrustInstanceBackupCreatedEvent, BeyondtrustInstanceBackupCreationFailedEvent } from '../../events';
import { BeyondtrustInstanceBackup } from '../../models';
import { BeyondtrustInstanceBackupEntity } from '../../repositories/entities';
import { BeyondtrustInstanceBackupRepositoryService } from '../../repositories/services/beyondtrust-instance-backup-repository.service';
import { CreateBeyondtrustInstanceBackupCommand } from '../create-beyondtrust-instance-backup.command';

@CommandHandler(CreateBeyondtrustInstanceBackupCommand)
export class CreateBeyondtrustInstanceBackupCommandHandler
    implements ICommandHandler<CreateBeyondtrustInstanceBackupCommand>
{
    private static readonly BACKUP_FILE_EXTENSION = '.nsb';

    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly beyondtrustInstanceBackupRepositoryService: BeyondtrustInstanceBackupRepositoryService,
    ) {}

    public async execute(command: CreateBeyondtrustInstanceBackupCommand): Promise<BeyondtrustInstanceBackup> {
        const beyondtrustInstance = await this.getBeyondtrustInstance(
            command.transactionId,
            command.beyondtrustInstanceId,
        );

        try {
            const relativeFilePath = await this.downloadBackupFile(
                command.transactionId,
                command.beyondtrustInstanceId,
                command.password,
            );
            const beyondTrustInstanceEntity = BeyondtrustInstanceBackupEntity.createWithoutId(
                beyondtrustInstance.id,
                relativeFilePath,
            );
            const createdBeyondtrustInstanceBackup =
                await this.beyondtrustInstanceBackupRepositoryService.create(beyondTrustInstanceEntity);

            this.eventBus.publish(
                new BeyondtrustInstanceBackupCreatedEvent(command.transactionId, {
                    beyondtrustInstanceBackup: createdBeyondtrustInstanceBackup,
                }),
            );

            return createdBeyondtrustInstanceBackup;
        } catch (error) {
            this.eventBus.publish(
                new BeyondtrustInstanceBackupCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    beyondtrustInstanceId: command.beyondtrustInstanceId,
                }),
            );

            throw error;
        }
    }

    private async getBeyondtrustInstance(
        transactionId: string,
        beyondtrustInstanceId: number,
    ): Promise<BeyondtrustInstance> {
        const beyondtrustInstance = await this.queryBus.execute<
            RetrieveBeyondtrustInstanceByIdQuery,
            BeyondtrustInstance
        >(new RetrieveBeyondtrustInstanceByIdQuery(transactionId, beyondtrustInstanceId));

        return beyondtrustInstance;
    }

    private async downloadBackupFile(
        transactionId: string,
        beyondtrustInstanceId: number,
        password?: string,
    ): Promise<string> {
        const relativeFilePath = UrlUtility.join(
            this.appConfigService.storage.beyondTrustBackupPath,
            `${transactionId}-${Date.now()}${CreateBeyondtrustInstanceBackupCommandHandler.BACKUP_FILE_EXTENSION}`,
        );
        const absoluteFilePath = UrlUtility.join(this.appConfigService.storage.rootPath, relativeFilePath);

        // Ensure the directory exists
        fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });

        const backupFileBuffer = await this.commandBus.execute<CreateBackupCommand, Buffer>(
            new CreateBackupCommand(transactionId, beyondtrustInstanceId, password),
        );

        return new Promise((resolve, reject) => {
            fs.writeFile(absoluteFilePath, backupFileBuffer, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(relativeFilePath);
                }
            });
        });
    }
}
