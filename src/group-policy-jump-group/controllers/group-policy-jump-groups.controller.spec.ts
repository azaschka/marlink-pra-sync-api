import { CommandBus } from '@nestjs/cqrs';
import { UuidUtility } from '../../shared/utilities';
import { AddJumpGroupToGroupPolicyCommand, RemoveJumpGroupFromGroupPolicyCommand } from '../commands';
import { GroupPolicyJumpGroup } from '../models';
import { GroupPolicyJumpGroupsController } from './group-policy-jump-groups.controller';

describe('GroupPolicyJumpGroupsController', () => {
    let controller: GroupPolicyJumpGroupsController;
    let commandBus: CommandBus;

    beforeEach(() => {
        commandBus = mockCommandBus();
        controller = new GroupPolicyJumpGroupsController(commandBus);

        // Mocking UuidUtility.generate to return a fixed UUID
        UuidUtility.generate = jest.fn(() => 'uuid-123');
    });

    describe('addJumpGroupToGroupPolicy', () => {
        it('should execute the command bus with the correct parameters and return the result', async () => {
            const expectedResult = {} as GroupPolicyJumpGroup;
            const commandBusExecuteSpy = jest.spyOn(commandBus, 'execute').mockResolvedValue(expectedResult);

            const result = await controller.addJumpGroupToGroupPolicy(undefined, 1, {
                jumpGroupId: 2,
                jumpItemRoleId: 3,
                jumpPolicyId: 4,
            });

            expect(commandBusExecuteSpy).toHaveBeenCalledWith(
                new AddJumpGroupToGroupPolicyCommand('uuid-123', 1, 2, 3, 4),
            );
            expect(result).toBe(expectedResult);
        });
    });

    describe('removeJumpGroupFromGroupPolicy', () => {
        it('should execute the command bus with the correct parameters', async () => {
            const commandBusExecuteSpy = jest.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

            await controller.removeJumpGroupFromGroupPolicy(undefined, 1, 2);

            expect(commandBusExecuteSpy).toHaveBeenCalledWith(
                new RemoveJumpGroupFromGroupPolicyCommand('uuid-123', 1, 2),
            );
        });
    });
});

function mockCommandBus() {
    const commandBus = {} as CommandBus;
    commandBus.execute = jest.fn();

    return commandBus;
}
