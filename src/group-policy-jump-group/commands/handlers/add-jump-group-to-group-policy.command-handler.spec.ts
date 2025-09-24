import { CommandBus, EventBus } from '@nestjs/cqrs';
import { AddJumpGroupToGroupPolicyCommand as BTAddJumpGroupToGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { JumpGroupAddedToGroupPolicyDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyJumpGroupAddedEvent, GroupPolicyJumpGroupAdditionFailedEvent } from '../../events';
import { GroupPolicyJumpGroupEntity } from '../../repositories/entities';
import { GroupPolicyJumpGroupRepositoryService } from '../../repositories/services/group-policy-jump-group-repository.service';
import { AddJumpGroupToGroupPolicyCommand } from '../add-jump-group-to-group-policy.command';
import { AddJumpGroupToGroupPolicyCommandHandler } from './add-jump-group-to-group-policy.command-handler';

abstract class TestHelper {
    public static get mockedJumpGroupAddedToGroupPolicyDtoOutput(): JumpGroupAddedToGroupPolicyDtoOutput {
        return {
            jumpGroupId: 2,
            jumpItemRoleId: 3,
            jumpPolicyId: 4,
        };
    }
}

describe('AddJumpGroupToGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let groupPolicyJumpGroupRepositoryService: GroupPolicyJumpGroupRepositoryService;
    let handler: AddJumpGroupToGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        groupPolicyJumpGroupRepositoryService = mockGroupPolicyJumpGroupRepositoryService();
        handler = new AddJumpGroupToGroupPolicyCommandHandler(
            commandBus,
            eventBus,
            groupPolicyJumpGroupRepositoryService,
        );
    });

    describe('execute', () => {
        it.each([
            <AddJumpGroupToGroupPolicyCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                jumpGroupId: 2,
            },
            <AddJumpGroupToGroupPolicyCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                id: 3,
                jumpGroupId: 4,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const groupPolicyJumpGroupEntityToBeCreated = {
                    groupPolicyId: 100,
                    jumpGroupId: 101,
                    lastSyncDate: new Date('2025-01-01T00:00:00Z'),
                } as GroupPolicyJumpGroupEntity;
                const groupPolicyJumpGroupEntityCreateMethod = jest
                    .spyOn(GroupPolicyJumpGroupEntity, 'create')
                    .mockReturnValue(groupPolicyJumpGroupEntityToBeCreated);
                const groupPolicyJumpGroupRepositoryServiceCreateMethod = jest.spyOn(
                    groupPolicyJumpGroupRepositoryService,
                    'create',
                );

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTAddJumpGroupToGroupPolicyCommand(command.transactionId, command.id, command.jumpGroupId),
                );
                expect(groupPolicyJumpGroupEntityCreateMethod).toHaveBeenCalledWith(
                    command.id,
                    TestHelper.mockedJumpGroupAddedToGroupPolicyDtoOutput.jumpGroupId,
                    TestHelper.mockedJumpGroupAddedToGroupPolicyDtoOutput.jumpItemRoleId,
                    TestHelper.mockedJumpGroupAddedToGroupPolicyDtoOutput.jumpPolicyId,
                );
                expect(groupPolicyJumpGroupRepositoryServiceCreateMethod).toHaveBeenCalledWith(
                    123,
                    groupPolicyJumpGroupEntityToBeCreated,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPolicyJumpGroupAddedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyJumpGroupAddedEvent.EVENT_TYPE,
                        payload: {
                            groupPolicyJumpGroup: result,
                            tenantId: 123,
                        },
                    }),
                );
                expect(result).toStrictEqual({
                    groupPolicyId: groupPolicyJumpGroupEntityToBeCreated.groupPolicyId,
                    jumpGroupId: groupPolicyJumpGroupEntityToBeCreated.jumpGroupId,
                    jumpItemRoleId: groupPolicyJumpGroupEntityToBeCreated.jumpItemRoleId,
                    jumpPolicyId: groupPolicyJumpGroupEntityToBeCreated.jumpPolicyId,
                    lastSyncDate: groupPolicyJumpGroupEntityToBeCreated.lastSyncDate,
                });
            },
        );

        it('should throw an error if the command bus fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<AddJumpGroupToGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    jumpGroupId: 4,
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const groupPolicyJumpGroupEntityToBeCreated = {
                groupPolicyId: 100,
                jumpGroupId: 101,
            } as GroupPolicyJumpGroupEntity;
            const groupPolicyJumpGroupEntityCreateMethod = jest
                .spyOn(GroupPolicyJumpGroupEntity, 'create')
                .mockReturnValue(groupPolicyJumpGroupEntityToBeCreated);
            const expectedError = new Error('Error');
            const groupPolicyJumpGroupRepositoryServiceCreateMethod = jest
                .spyOn(groupPolicyJumpGroupRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<AddJumpGroupToGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    jumpGroupId: 4,
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(groupPolicyJumpGroupEntityCreateMethod).toHaveBeenCalled();
            expect(groupPolicyJumpGroupRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyJumpGroupAdditionFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        groupPolicyJumpGroup: {
                            groupPolicyId: groupPolicyJumpGroupEntityToBeCreated.groupPolicyId,
                            jumpGroupId: groupPolicyJumpGroupEntityToBeCreated.jumpGroupId,
                        },
                        tenantId: 123,
                    },
                }),
            );
        });
    });
});

function mockEventBus() {
    const eventBus = {} as EventBus;
    eventBus.publish = jest.fn();

    return eventBus;
}

function mockCommandBus() {
    const commandBus = {} as CommandBus;
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedJumpGroupAddedToGroupPolicyDtoOutput);

    return commandBus;
}

function mockGroupPolicyJumpGroupRepositoryService() {
    const groupPolicyJumpGroupRepositoryService = {} as GroupPolicyJumpGroupRepositoryService;
    groupPolicyJumpGroupRepositoryService.create = jest.fn();

    return groupPolicyJumpGroupRepositoryService;
}
