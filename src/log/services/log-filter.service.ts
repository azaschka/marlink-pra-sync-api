import { Injectable } from '@nestjs/common';
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
