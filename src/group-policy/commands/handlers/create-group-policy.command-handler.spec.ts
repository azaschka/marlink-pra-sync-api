import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateGroupPolicyCommand as BTCreateGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { GroupPolicyCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { AccessPermissionStatusType as BTAccessPermissionStatusType } from '../../../beyondtrust-pra-conf-api/group-policy/enums';
import { AccessPermissionStatusType } from '../../enums';
import { GroupPolicyCreatedEvent, GroupPolicyCreationFailedEvent } from '../../events';
import { mapFromBTAccessPermissionStatusType, mapToBTAccessPermissionStatusType } from '../../mappers';
import { GroupPolicyEntity } from '../../repositories/entities';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { CreateGroupPolicyCommand } from '../create-group-policy.command';
import { CreateGroupPolicyCommandHandler } from './create-group-policy.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTAccessPermissionStatusType: jest.fn().mockImplementation((type: BTAccessPermissionStatusType) => type),
    mapToBTAccessPermissionStatusType: jest.fn().mockImplementation((type: BTAccessPermissionStatusType) => type),
}));

abstract class TestHelper {
    public static get mockedGroupPolicyCreatedDtoOutput(): GroupPolicyCreatedDtoOutput {
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

describe('CreateGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let groupPolicyRepositoryService: GroupPolicyRepositoryService;
    let handler: CreateGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        groupPolicyRepositoryService = mockGroupPolicyRepositoryService();
        handler = new CreateGroupPolicyCommandHandler(commandBus, eventBus, groupPolicyRepositoryService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it.each([
            <CreateGroupPolicyCommand>{
                transactionId: 'transaction-1',
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
            <CreateGroupPolicyCommand>{
                transactionId: 'transaction-2',
                name: 'group-policy-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const groupPolicyEntityToBeCreated = {} as GroupPolicyEntity;
                const groupPolicyEntityCreateWithoutIdMethod = jest
                    .spyOn(GroupPolicyEntity, 'createWithoutId')
                    .mockReturnValue(groupPolicyEntityToBeCreated);

                const expectedResult = { id: 123 } as GroupPolicyEntity;
                const groupPolicyRepositoryServiceCreateMethod = jest
                    .spyOn(groupPolicyRepositoryService, 'create')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateGroupPolicyCommand(
                        command.transactionId,
                        command.name,
                        command.hasEndpointsAccessPermission,
                        command.accessPermissionStatusType
                            ? mapToBTAccessPermissionStatusType(command.accessPermissionStatusType)
                            : undefined,
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
                expect(groupPolicyEntityCreateWithoutIdMethod).toHaveBeenCalledWith(
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.name,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.id,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permAccessAllowed,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.accessPermStatus
                        ? mapFromBTAccessPermissionStatusType(
                              TestHelper.mockedGroupPolicyCreatedDtoOutput.accessPermStatus,
                          )
                        : undefined,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permShareOtherTeam,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permInviteExternalUser,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permSessionIdleTimeout,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permExtendedAvailabilityModeAllowed,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permEditExternalKey,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permCollaborate,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permCollaborateControl,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permJumpClient,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permLocalJump,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permRemoteJump,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permRemoteVnc,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permRemoteRdp,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permShellJump,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permWebJump,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permProtocolTunnel,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permSdStaticPortForExternalTools,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.defaultJumpItemRoleId,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.privateJumpItemRoleId,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.inferiorJumpItemRoleId,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.unassignedJumpItemRoleId,
                );
                expect(groupPolicyRepositoryServiceCreateMethod).toHaveBeenCalledWith(groupPolicyEntityToBeCreated);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPolicyCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyCreatedEvent.EVENT_TYPE,
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
                handler.execute(<CreateGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    name: 'group-policy-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const groupPolicyEntityToBeCreated = { name: 'group-policy-1', btId: 123 } as GroupPolicyEntity;
            const groupPolicyEntityCreateWithoutIdMethod = jest
                .spyOn(GroupPolicyEntity, 'createWithoutId')
                .mockReturnValue(groupPolicyEntityToBeCreated);
            const expectedError = new Error('Error');
            const groupPolicyRepositoryServiceCreateMethod = jest
                .spyOn(groupPolicyRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

            // Act & Assert
            await expect(
                handler.execute(<CreateGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    name: 'group-policy-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(groupPolicyEntityCreateWithoutIdMethod).toHaveBeenCalled();
            expect(groupPolicyRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        error: expectedError,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedGroupPolicyCreatedDtoOutput);

    return commandBus;
}

function mockGroupPolicyRepositoryService() {
    const groupPolicyRepositoryService = {} as GroupPolicyRepositoryService;
    groupPolicyRepositoryService.create = jest.fn();

    return groupPolicyRepositoryService;
}
