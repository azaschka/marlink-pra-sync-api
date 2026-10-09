import { Injectable } from '@nestjs/common';
import { ICommand } from '@nestjs/cqrs';
import { CreateBeyondtrustInstanceBackupCommand } from '../../beyondtrust-instance-backup/commands';
import { CreateBackupCommand as BTCreateBackupCommand } from '../../beyondtrust-pra-conf-api/backup/commands';
import {
    CreateUserCommand as BTCreateUserCommand,
    ModifyUserCommand as BTModifyUserCommand,
} from '../../beyondtrust-pra-conf-api/user/commands';
import { BaseCommand } from '../../core/commands';
import { ObjectUtility } from '../../shared/utilities';
import { CreateUserCommand, ModifyUserCommand } from '../../user/commands';

@Injectable()
export class LogFilterService {
    // Command types that are not written to the system log (none in this service, see PRA API for an example).
    private static readonly EXCLUDED_COMMAND_TYPES: ReadonlyArray<abstract new (...args: never[]) => ICommand> = [];

    public isExcludedFromLog(command: ICommand): boolean {
        return LogFilterService.EXCLUDED_COMMAND_TYPES.some((commandType) => command instanceof commandType);
    }

    public filterCommand(command: BaseCommand): BaseCommand {
        if (
            command instanceof CreateUserCommand ||
            command instanceof BTCreateUserCommand ||
            command instanceof ModifyUserCommand ||
            command instanceof BTModifyUserCommand ||
            command instanceof CreateBeyondtrustInstanceBackupCommand ||
            command instanceof BTCreateBackupCommand
        ) {
            return ObjectUtility.stripProperties(command, 'password');
        }

        return command;
    }
}
