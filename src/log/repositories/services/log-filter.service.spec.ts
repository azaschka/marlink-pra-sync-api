import {
    CreateUserCommand as BTCreateUserCommand,
    ModifyUserCommand as BTModifyUserCommand,
} from '../../../beyondtrust-pra-conf-api/user/commands';
import { BaseCommand } from '../../../core/commands';
import { ObjectUtility } from '../../../shared/utilities';
import { CreateUserCommand, ModifyUserCommand } from '../../../user/commands';
import { LogFilterService } from './log-filter.service';

describe('LogFilterService', () => {
    let logFilterService: LogFilterService;

    beforeEach(() => {
        logFilterService = new LogFilterService();
    });

    describe('filterCommand', () => {
        it.each([
            new CreateUserCommand('transaction-1', 'display-name', 'username', 'password123'),
            new BTCreateUserCommand('transaction-2', 'display-name', 'username', 'password123'),
            new ModifyUserCommand('transaction-3', 123, 'display-name', 'username', 'password123'),
            new BTModifyUserCommand('transaction-4', 123, 'display-name', 'username', 'password123'),
        ])('should return as expected', (command) => {
            const expectedResult = { transactionId: 'transaction-123' } as BaseCommand;
            jest.spyOn(ObjectUtility, 'stripProperty').mockReturnValue(expectedResult);

            const filteredCommand = logFilterService.filterCommand(command);

            expect(filteredCommand).toBe(expectedResult);
            expect(ObjectUtility.stripProperty).toHaveBeenCalledWith(command, 'password');
        });
    });
});
