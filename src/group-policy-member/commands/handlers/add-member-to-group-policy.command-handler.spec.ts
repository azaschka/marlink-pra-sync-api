import { CommandBus, EventBus } from '@nestjs/cqrs';
import { AddMemberToGroupPolicyCommand as BTAddMemberToGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { MemberAddedToGroupPolicyDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyMemberAddedEvent, GroupPolicyMemberAdditionFailedEvent } from '../../events';
import { GroupPolicyMemberEntity } from '../../repositories/entities';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { AddMemberToGroupPolicyCommand } from '../add-member-to-group-policy.command';
import { AddMemberToGroupPolicyCommandHandler } from './add-member-to-group-policy.command-handler';

abstract class TestHelper {
    public static get mockedMemberAddedToGroupPolicyDtoOutput(): MemberAddedToGroupPolicyDtoOutput {
        return {
            id: 1,
            userId: 2,
            securityProviderId: 3,
            distinguishedName: 'distinguished-name',
            groupName: 'group-name',
        };
    }
}

describe('AddMemberToGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService;
    let handler: AddMemberToGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        groupPolicyMemberRepositoryService = mockGroupPolicyMemberRepositoryService();
        handler = new AddMemberToGroupPolicyCommandHandler(commandBus, eventBus, groupPolicyMemberRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <AddMemberToGroupPolicyCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                userId: 2,
            },
            <AddMemberToGroupPolicyCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                id: 3,
                userId: 4,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const groupPolicyMemberEntityToBeCreated = {
                    groupPolicyId: 100,
                    userId: 101,
                    memberId: 102,
                    lastSyncDate: new Date('2025-10-01T00:00:00Z'),
                } as GroupPolicyMemberEntity;
                const groupPolicyMemberEntityCreateMethod = jest
                    .spyOn(GroupPolicyMemberEntity, 'create')
                    .mockReturnValue(groupPolicyMemberEntityToBeCreated);
                const groupPolicyMemberRepositoryServiceCreateMethod = jest.spyOn(
                    groupPolicyMemberRepositoryService,
                    'create',
                );

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTAddMemberToGroupPolicyCommand(
                        command.transactionId,
                        command.tenantId,
                        command.id,
                        command.userId,
                        command.securityProviderId,
                        command.distinguishedName,
                        command.groupName,
                    ),
                );
                expect(groupPolicyMemberEntityCreateMethod).toHaveBeenCalledWith(
                    command.id,
                    TestHelper.mockedMemberAddedToGroupPolicyDtoOutput.id,
                    TestHelper.mockedMemberAddedToGroupPolicyDtoOutput.userId,
                    TestHelper.mockedMemberAddedToGroupPolicyDtoOutput.securityProviderId,
                    TestHelper.mockedMemberAddedToGroupPolicyDtoOutput.distinguishedName,
                    TestHelper.mockedMemberAddedToGroupPolicyDtoOutput.groupName,
                );
                expect(groupPolicyMemberRepositoryServiceCreateMethod).toHaveBeenCalledWith(
                    command.tenantId,
                    groupPolicyMemberEntityToBeCreated,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPolicyMemberAddedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyMemberAddedEvent.EVENT_TYPE,
                        payload: {
                            groupPolicyMember: result,
                            tenantId: 123,
                        },
                    }),
                );
                expect(result).toStrictEqual({
                    groupPolicyId: groupPolicyMemberEntityToBeCreated.groupPolicyId,
                    memberId: groupPolicyMemberEntityToBeCreated.memberId,
                    userId: groupPolicyMemberEntityToBeCreated.userId,
                    securityProviderId: groupPolicyMemberEntityToBeCreated.securityProviderId,
                    distinguishedName: groupPolicyMemberEntityToBeCreated.distinguishedName,
                    groupName: groupPolicyMemberEntityToBeCreated.groupName,
                    lastSyncDate: groupPolicyMemberEntityToBeCreated.lastSyncDate,
                });
            },
        );

        it('should throw an error if the command bus fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<AddMemberToGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    userId: 4,
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const groupPolicyMemberEntityToBeCreated = {
                groupPolicyId: 100,
                userId: 101,
                memberId: 102,
            } as GroupPolicyMemberEntity;
            const groupPolicyMemberEntityCreateMethod = jest
                .spyOn(GroupPolicyMemberEntity, 'create')
                .mockReturnValue(groupPolicyMemberEntityToBeCreated);
            const expectedError = new Error('Error');
            const groupPolicyMemberRepositoryServiceCreateMethod = jest
                .spyOn(groupPolicyMemberRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<AddMemberToGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    userId: 4,
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(groupPolicyMemberEntityCreateMethod).toHaveBeenCalled();
            expect(groupPolicyMemberRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyMemberAdditionFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        groupPolicyMember: {
                            groupPolicyId: groupPolicyMemberEntityToBeCreated.groupPolicyId,
                            userId: groupPolicyMemberEntityToBeCreated.userId,
                            memberId: groupPolicyMemberEntityToBeCreated.memberId,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedMemberAddedToGroupPolicyDtoOutput);

    return commandBus;
}

function mockGroupPolicyMemberRepositoryService() {
    const groupPolicyMemberRepositoryService = {} as GroupPolicyMemberRepositoryService;
    groupPolicyMemberRepositoryService.create = jest.fn();

    return groupPolicyMemberRepositoryService;
}
