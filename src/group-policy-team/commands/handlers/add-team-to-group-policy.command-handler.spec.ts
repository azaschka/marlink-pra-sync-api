import { CommandBus, EventBus } from '@nestjs/cqrs';
import { AddTeamToGroupPolicyCommand as BTAddTeamToGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { TeamAddedToGroupPolicyDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { GroupPolicyTeamRoleType as BTGroupPolicyTeamRoleType } from '../../../beyondtrust-pra-conf-api/group-policy/enums';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyTeamRoleType } from '../../enums';
import { GroupPolicyTeamAddedEvent, GroupPolicyTeamAdditionFailedEvent } from '../../events';
import { GroupPolicyTeamEntity } from '../../repositories/entities';
import { GroupPolicyTeamRepositoryService } from '../../repositories/services/group-policy-team-repository.service';
import { AddTeamToGroupPolicyCommand } from '../add-team-to-group-policy.command';
import { AddTeamToGroupPolicyCommandHandler } from './add-team-to-group-policy.command-handler';

abstract class TestHelper {
    public static get mockedTeamAddedToGroupPolicyDtoOutput(): TeamAddedToGroupPolicyDtoOutput {
        return {
            teamId: 2,
            role: BTGroupPolicyTeamRoleType.Lead,
        };
    }
}

describe('AddTeamToGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let groupPolicyTeamRepositoryService: GroupPolicyTeamRepositoryService;
    let handler: AddTeamToGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        groupPolicyTeamRepositoryService = mockGroupPolicyTeamRepositoryService();
        handler = new AddTeamToGroupPolicyCommandHandler(commandBus, eventBus, groupPolicyTeamRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <AddTeamToGroupPolicyCommand>{
                transactionId: 'transaction-1',
                id: 1,
                teamId: 2,
            },
            <AddTeamToGroupPolicyCommand>{
                transactionId: 'transaction-2',
                id: 3,
                teamId: 4,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const groupPolicyTeamEntityToBeCreated = {
                    groupPolicyId: 100,
                    teamId: 101,
                    roleType: GroupPolicyTeamRoleType.Lead,
                } as GroupPolicyTeamEntity;
                const groupPolicyTeamEntityCreateMethod = jest
                    .spyOn(GroupPolicyTeamEntity, 'create')
                    .mockReturnValue(groupPolicyTeamEntityToBeCreated);
                const groupPolicyTeamRepositoryServiceCreateMethod = jest.spyOn(
                    groupPolicyTeamRepositoryService,
                    'create',
                );

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTAddTeamToGroupPolicyCommand(command.transactionId, command.id, command.teamId),
                );
                expect(groupPolicyTeamEntityCreateMethod).toHaveBeenCalledWith(
                    command.id,
                    TestHelper.mockedTeamAddedToGroupPolicyDtoOutput.teamId,
                    TestHelper.mockedTeamAddedToGroupPolicyDtoOutput.role,
                );
                expect(groupPolicyTeamRepositoryServiceCreateMethod).toHaveBeenCalledWith(
                    groupPolicyTeamEntityToBeCreated,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPolicyTeamAddedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyTeamAddedEvent.EVENT_TYPE,
                        payload: {
                            groupPolicyTeam: result,
                        },
                    }),
                );
                expect(result).toStrictEqual({
                    groupPolicyId: groupPolicyTeamEntityToBeCreated.groupPolicyId,
                    teamId: groupPolicyTeamEntityToBeCreated.teamId,
                    roleType: groupPolicyTeamEntityToBeCreated.roleType,
                });
            },
        );

        it('should throw an error if the command bus fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<AddTeamToGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    teamId: 4,
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const groupPolicyTeamEntityToBeCreated = {
                groupPolicyId: 100,
                teamId: 101,
            } as GroupPolicyTeamEntity;
            const groupPolicyTeamEntityCreateMethod = jest
                .spyOn(GroupPolicyTeamEntity, 'create')
                .mockReturnValue(groupPolicyTeamEntityToBeCreated);
            const expectedError = new Error('Error');
            const groupPolicyTeamRepositoryServiceCreateMethod = jest
                .spyOn(groupPolicyTeamRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<AddTeamToGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    teamId: 4,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(groupPolicyTeamEntityCreateMethod).toHaveBeenCalled();
            expect(groupPolicyTeamRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyTeamAdditionFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        groupPolicyTeam: {
                            groupPolicyId: groupPolicyTeamEntityToBeCreated.groupPolicyId,
                            teamId: groupPolicyTeamEntityToBeCreated.teamId,
                        },
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedTeamAddedToGroupPolicyDtoOutput);

    return commandBus;
}

function mockGroupPolicyTeamRepositoryService() {
    const groupPolicyTeamRepositoryService = {} as GroupPolicyTeamRepositoryService;
    groupPolicyTeamRepositoryService.create = jest.fn();

    return groupPolicyTeamRepositoryService;
}
