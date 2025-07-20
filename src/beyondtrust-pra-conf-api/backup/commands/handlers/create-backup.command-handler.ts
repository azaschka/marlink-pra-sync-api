import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { CreateBackupDtoInput } from '../../dtos/inputs';
import { CreateBackupCommand } from '../create-backup.command';

@CommandHandler(CreateBackupCommand)
export class CreateBackupCommandHandler implements ICommandHandler<CreateBackupCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateBackupCommand): Promise<Buffer> {
        const url = this.appConfigService.beyondTrust.backup.apiUrl;

        return await this.httpClientService.post<Buffer, Buffer>(
            Buffer,
            url,
            CreateBackupDtoInput.create(command.password),
        );
    }
}
