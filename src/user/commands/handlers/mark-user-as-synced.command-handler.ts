import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { MarkUserAsSyncedCommand } from '../mark-user-as-synced.command';

@CommandHandler(MarkUserAsSyncedCommand)
export class MarkUserAsSyncedCommandHandler implements ICommandHandler<MarkUserAsSyncedCommand> {
    constructor(private readonly userRepositoryService: UserRepositoryService) {}

    public async execute(command: MarkUserAsSyncedCommand): Promise<void> {
        const user = await this.userRepositoryService.findOneById(command.tenantId, command.id);

        if (!user) {
            throw new NotFoundException(`User with ID "${command.id}" not found.`);
        }

        user.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.userRepositoryService.createOrUpdateById(command.tenantId, user);
    }
}
