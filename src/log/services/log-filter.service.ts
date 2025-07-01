import { Injectable } from '@nestjs/common';
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
            command instanceof BTModifyUserCommand
        ) {
            return ObjectUtility.stripProperties(command, 'password');
        }

        return command;
    }
}
