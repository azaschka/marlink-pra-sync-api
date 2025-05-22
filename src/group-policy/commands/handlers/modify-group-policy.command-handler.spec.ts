import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyGroupPolicyCommand as BTModifyGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { GroupPolicyModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { AccessPermissionStatusType as BTAccessPermissionStatusType } from '../../../beyondtrust-pra-conf-api/group-policy/enums';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { AccessPermissionStatusType } from '../../enums';
import { GroupPolicyModificationFailedEvent, GroupPolicyModifiedEvent } from '../../events';
import { GroupPolicyEntity } from '../../repositories/entities';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { ModifyGroupPolicyCommand } from '../modify-group-policy.command';
import { ModifyGroupPolicyCommandHandler } from './modify-group-policy.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTAccessPermissionStatusType: jest.fn().mockImplementation((type: BTAccessPermissionStatusType) => type),
    mapToBTAccessPermissionStatusType: jest.fn().mockImplementation((type: BTAccessPermissionStatusType) => type),
}));

abstract class TestHelper {
    public static get mockedGroupPolicyModifiedDtoOutput(): GroupPolicyModifiedDtoOutput {
        return {
            name: 'group-policy-1',
            id: 1,
            permAccessAllowed: false,
            accessPermStatus: BTAccessPermissionStatusType.Final,
            permShareOtherTeam: false,
            permInviteExternalUser: false,
            permSessionIdleTimeout: -1,
            permExtendedAvailabilityModeAllowed: false,
            permEditExternalKey: false,
            permCollaborate: false,
            permCollaborateControl: false,
            permJumpClient: false,
            permLocalJump: false,
            permRemoteJump: false,
            permRemoteVnc: false,
            permRemoteRdp: false,
            permShellJump: false,
            permWebJump: false,
            permProtocolTunnel: false,
            permSdStaticPortForExternalTools: false,
            defaultJumpItemRoleId: 1,
            privateJumpItemRoleId: 1,
            inferiorJumpItemRoleId: 1,
            unassignedJumpItemRoleId: 1,
        };
    }
}

describe('ModifyGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let groupPolicyRepositoryService: GroupPolicyRepositoryService;
    let handler: ModifyGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        groupPolicyRepositoryService = mockGroupPolicyRepositoryService();
        handler = new ModifyGroupPolicyCommandHandler(commandBus, eventBus, groupPolicyRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <ModifyGroupPolicyCommand>{
                transactionId: 'transaction-1',
                id: 1,
                name: 'group-policy-1',
                hasEndpointsAccessPermission: true,
                accessPermissionStatusType: AccessPermissionStatusType.Final,
                hasShareOtherTeamPermission: false,
                hasInviteExternalUserPermission: true,
                userSessionIdleTimeoutInSeconds: 3600,
                hasEnableExtendedAvailabilityModePermission: true,
                hasEditExternalKeyPermission: false,
                hasCollaboratePermission: true,
                hasCollaborateControlPermission: false,
                hasJumpClientPermission: true,
                hasLocalJumpPermission: false,
                hasRemoteJumpPermission: true,
                hasRemoteVncPermission: false,
                hasRemoteRdpPermission: true,
                hasShellJumpPermission: false,
                hasWebJumpPermission: true,
                hasProtocolTunnelPermission: false,
                hasSdStaticPortForExternalToolsPermission: true,
                defaultJumpItemRoleId: 1,
                privateJumpItemRoleId: 2,
                inferiorJumpItemRoleId: 3,
                unassignedJumpItemRoleId: 4,
            },
            <ModifyGroupPolicyCommand>{
                transactionId: 'transaction-2',
                id: 2,
                name: 'group-policy-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const groupPolicyEntityToBeUpdated = { id: 123 } as GroupPolicyEntity;
                const groupPolicyEntityCreateMethod = jest
                    .spyOn(GroupPolicyEntity, 'create')
                    .mockReturnValue(groupPolicyEntityToBeUpdated);

                const expectedResult = { id: 321 } as GroupPolicyEntity;
                const groupPolicyRepositoryServiceCreateOrUpdateByIdMethod = jest
                    .spyOn(groupPolicyRepositoryService, 'createOrUpdateById')
                    .mockResolvedValue(Promise.resolve());
                const groupPolicyRepositoryServiceFindByIdMethod = jest
                    .spyOn(groupPolicyRepositoryService, 'findOneById')
                    .mockResolvedValue(Promise.resolve(expectedResult));

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyGroupPolicyCommand(
                        command.transactionId,
                        command.id,
                        command.name,
                        command.hasEndpointsAccessPermission,
                        command.accessPermissionStatusType as unknown as BTAccessPermissionStatusType,
                        command.hasShareOtherTeamPermission,
                        command.hasInviteExternalUserPermission,
                        command.userSessionIdleTimeoutInSeconds,
                        command.hasEnableExtendedAvailabilityModePermission,
                        command.hasEditExternalKeyPermission,
                        command.hasCollaboratePermission,
                        command.hasCollaborateControlPermission,
                        command.hasJumpClientPermission,
                        command.hasLocalJumpPermission,
                        command.hasRemoteJumpPermission,
                        command.hasRemoteVncPermission,
                        command.hasRemoteRdpPermission,
                        command.hasShellJumpPermission,
                        command.hasWebJumpPermission,
                        command.hasProtocolTunnelPermission,
                        command.hasSdStaticPortForExternalToolsPermission,
                        command.defaultJumpItemRoleId,
                        command.privateJumpItemRoleId,
                        command.inferiorJumpItemRoleId,
                        command.unassignedJumpItemRoleId,
                    ),
                );
                expect(groupPolicyEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.id,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.name,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permAccessAllowed,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.accessPermStatus,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permShareOtherTeam,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permInviteExternalUser,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permSessionIdleTimeout,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permExtendedAvailabilityModeAllowed,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permEditExternalKey,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permCollaborate,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permCollaborateControl,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permJumpClient,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permLocalJump,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permRemoteJump,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permRemoteVnc,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permRemoteRdp,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permShellJump,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permWebJump,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permProtocolTunnel,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.permSdStaticPortForExternalTools,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.defaultJumpItemRoleId,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.privateJumpItemRoleId,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.inferiorJumpItemRoleId,
                    TestHelper.mockedGroupPolicyModifiedDtoOutput.unassignedJumpItemRoleId,
                );
                expect(groupPolicyRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
                    groupPolicyEntityToBeUpdated,
                );
                expect(groupPolicyRepositoryServiceFindByIdMethod).toHaveBeenCalledWith(
                    groupPolicyEntityToBeUpdated.id,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPolicyModifiedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyModifiedEvent.EVENT_TYPE,
                        payload: {
                            groupPolicy: result,
                        },
                    }),
                );
                expect(result).toBe(expectedResult);
            },
        );

        it('should throw an error if the command bus fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<ModifyGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    name: 'group-policy-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error if the group policy retrieval from repository returns null', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const groupPolicyEntityToBeCreated = { name: 'group-policy-1', id: 123 } as GroupPolicyEntity;
            const groupPolicyEntityCreateMethod = jest
                .spyOn(GroupPolicyEntity, 'create')
                .mockReturnValue(groupPolicyEntityToBeCreated);
            const groupPolicyRepositoryServiceCreateOrUpdateByIdMethod = jest.spyOn(
                groupPolicyRepositoryService,
                'createOrUpdateById',
            );
            const groupPolicyRepositoryServiceFindByIdMethod = jest
                .spyOn(groupPolicyRepositoryService, 'findOneById')
                .mockResolvedValue(null);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    name: 'group-policy-1',
                }),
            ).rejects.toThrow();
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(groupPolicyEntityCreateMethod).toHaveBeenCalled();
            expect(groupPolicyRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(groupPolicyRepositoryServiceFindByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalled();
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        groupPolicy: groupPolicyEntityToBeCreated,
                    },
                }),
            );
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const groupPolicyEntityToBeCreated = { name: 'group-policy-1', id: 123 } as GroupPolicyEntity;
            const groupPolicyEntityCreateMethod = jest
                .spyOn(GroupPolicyEntity, 'create')
                .mockReturnValue(groupPolicyEntityToBeCreated);
            const expectedError = new Error('Error');
            const groupPolicyRepositoryServiceCreateOrUpdateByIdMethod = jest
                .spyOn(groupPolicyRepositoryService, 'createOrUpdateById')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    name: 'group-policy-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(groupPolicyEntityCreateMethod).toHaveBeenCalled();
            expect(groupPolicyRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        groupPolicy: groupPolicyEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedGroupPolicyModifiedDtoOutput);

    return commandBus;
}

function mockGroupPolicyRepositoryService() {
    const groupPolicyRepositoryService = {} as GroupPolicyRepositoryService;
    groupPolicyRepositoryService.createOrUpdateById = jest.fn();
    groupPolicyRepositoryService.findOneById = jest.fn();

    return groupPolicyRepositoryService;
}
