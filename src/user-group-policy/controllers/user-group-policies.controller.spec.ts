import { CommandBus } from '@nestjs/cqrs';
import { UuidUtility } from '../../shared/utilities';
import { ModifyUserGroupPoliciesCommand } from '../commands';
import { UserGroupPolicies } from '../models';
import { UserGroupPoliciesController } from './user-group-policies.controller';

describe('UserController', () => {
    let controller: UserGroupPoliciesController;
    let commandBus: CommandBus;

    beforeEach(() => {
        commandBus = mockCommandBus();
        controller = new UserGroupPoliciesController(commandBus);

        // Mocking UuidUtility.generate to return a fixed UUID
        UuidUtility.generate = jest.fn(() => 'uuid-123');
    });

    describe('modifyUserGroupPolicies', () => {
        it('should execute the command bus with the correct parameters and return the result', async () => {
            const expectedResult = {} as UserGroupPolicies;
            const commandBusExecuteSpy = jest.spyOn(commandBus, 'execute').mockResolvedValue(expectedResult);

            const result = await controller.modifyUserGroupPolicies(1, {
                groupPolicyIdsToAdd: [1, 2],
                groupPolicyIdsToRemove: [3],
            });

            expect(commandBusExecuteSpy).toHaveBeenCalledWith(
                new ModifyUserGroupPoliciesCommand('uuid-123', 1, [1, 2], [3]),
            );
            expect(result).toBe(expectedResult);
        });
    });
});

function mockCommandBus() {
    const commandBus = {} as CommandBus;
    commandBus.execute = jest.fn();

    return commandBus;
}
