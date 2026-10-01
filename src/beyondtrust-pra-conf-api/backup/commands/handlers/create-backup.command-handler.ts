import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { CreateBackupDtoInput } from '../../dtos/inputs';
import { CreateBackupCommand } from '../create-backup.command';

/**
 * Creates a backup on BeyondTrust and streams it byte-for-byte into command.targetFilePath. The body used to go
 * through the generic JSON client path and was stored as text, so binary backups were not byte-identical.
 */
@CommandHandler(CreateBackupCommand)
export class CreateBackupCommandHandler implements ICommandHandler<CreateBackupCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateBackupCommand): Promise<{ bytes: number }> {
        return await this.httpClientService.postToFile(
            command.transactionId,
            command.beyondtrustInstanceId,
            this.appConfigService.beyondTrust.api.backup.path,
            CreateBackupDtoInput.create(command.password),
            command.targetFilePath,
        );
    }
}
