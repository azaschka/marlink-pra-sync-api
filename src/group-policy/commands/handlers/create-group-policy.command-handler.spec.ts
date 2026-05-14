import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CreateGroupPolicyCommand as BTCreateGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import {
    GroupPolicyCreatedDtoOutput,
    GroupPolicyRetrievedDtoOutput,
} from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { AccessPermissionStatusType as BTAccessPermissionStatusType } from '../../../beyondtrust-pra-conf-api/group-policy/enums';
import { RetrieveGroupPoliciesQuery as BTRetrieveGroupPoliciesQuery } from '../../../beyondtrust-pra-conf-api/group-policy/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { AccessPermissionStatusType } from '../../enums';
import { GroupPolicyCreatedEvent, GroupPolicyCreationFailedEvent } from '../../events';
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

    let queryBus: QueryBus;

    beforeEach(() => {
        commandBus = mockCommandBus();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        groupPolicyRepositoryService = mockGroupPolicyRepositoryService();
        handler = new CreateGroupPolicyCommandHandler(commandBus, queryBus, eventBus, groupPolicyRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <CreateGroupPolicyCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
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
                tenantId: 123,
                name: 'group-policy-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const groupPolicyEntityToBeCreated = { id: 123 } as GroupPolicyEntity;
                const groupPolicyEntityCreateMethod = jest
                    .spyOn(GroupPolicyEntity, 'create')
                    .mockReturnValue(groupPolicyEntityToBeCreated);

                const expectedResult = { id: 321 } as GroupPolicyEntity;
                const groupPolicyRepositoryServiceCreateMethod = jest
                    .spyOn(groupPolicyRepositoryService, 'create')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateGroupPolicyCommand(
                        command.transactionId,
                        command.tenantId,
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
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.id,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.name,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.permAccessAllowed,
                    TestHelper.mockedGroupPolicyCreatedDtoOutput.accessPermStatus,
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
                expect(groupPolicyRepositoryServiceCreateMethod).toHaveBeenCalledWith(
                    123,
                    groupPolicyEntityToBeCreated,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPolicyCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyCreatedEvent.EVENT_TYPE,
                        payload: {
                            groupPolicy: result,
                            tenantId: 123,
                        },
                    }),
                );
                expect(result).toBe(expectedResult);
            },
        );

        it('should throw an error if the command bus fails with a non-422 error', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<CreateGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    tenantId: 123,
                    name: 'group-policy-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should fetch the existing policy from BeyondTrust and upsert it to the local DB when BeyondTrust returns 422 name-already-taken', async () => {
            // Arrange
            const nameAlreadyTakenError = new HttpException({}, HttpStatus.UNPROCESSABLE_ENTITY);

            const existingBtPolicy: GroupPolicyRetrievedDtoOutput = {
                ...TestHelper.mockedGroupPolicyCreatedDtoOutput,
                id: 999,
                name: 'group-policy-1',
            };

            // commandBus: first call (BTCreateGroupPolicyCommand) rejects; second call (BTRetrieveGroupPoliciesQuery via queryBus) resolves
            jest.spyOn(commandBus, 'execute').mockRejectedValue(nameAlreadyTakenError);
            const queryBusExecuteMethod = jest.spyOn(queryBus, 'execute').mockResolvedValue([existingBtPolicy]);

            const groupPolicyEntityToBeCreated = { id: 999, name: 'group-policy-1' } as GroupPolicyEntity;
            jest.spyOn(GroupPolicyEntity, 'create').mockReturnValue(groupPolicyEntityToBeCreated);

            const createOrUpdateByIdMethod = jest
                .spyOn(groupPolicyRepositoryService, 'createOrUpdateById')
                .mockResolvedValue(undefined);

            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

            // Act
            const result = await handler.execute(<CreateGroupPolicyCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'group-policy-1',
            });

            // Assert
            expect(queryBusExecuteMethod).toHaveBeenCalledWith(
                new BTRetrieveGroupPoliciesQuery('transaction-1', 123, 1, 1, 'group-policy-1'),
            );
            expect(createOrUpdateByIdMethod).toHaveBeenCalledWith(123, groupPolicyEntityToBeCreated);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyCreatedEvent.EVENT_TYPE,
                }),
            );
            expect(result).toBe(groupPolicyEntityToBeCreated);
        });

        it('should rethrow the 422 error if the policy cannot be found in BeyondTrust after name-already-taken', async () => {
            // Arrange
            const nameAlreadyTakenError = new HttpException({}, HttpStatus.UNPROCESSABLE_ENTITY);

            jest.spyOn(commandBus, 'execute').mockRejectedValue(nameAlreadyTakenError);
            jest.spyOn(queryBus, 'execute').mockResolvedValue([]);

            // Act & Assert
            await expect(
                handler.execute(<CreateGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    tenantId: 123,
                    name: 'group-policy-1',
                }),
            ).rejects.toThrow(nameAlreadyTakenError);
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const groupPolicyEntityToBeCreated = { name: 'group-policy-1', id: 123 } as GroupPolicyEntity;
            const groupPolicyEntityCreateMethod = jest
                .spyOn(GroupPolicyEntity, 'create')
                .mockReturnValue(groupPolicyEntityToBeCreated);
            const expectedError = new Error('Error');
            const groupPolicyRepositoryServiceCreateMethod = jest
                .spyOn(groupPolicyRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CreateGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    tenantId: 123,
                    name: 'group-policy-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(groupPolicyEntityCreateMethod).toHaveBeenCalled();
            expect(groupPolicyRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        groupPolicy: groupPolicyEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedGroupPolicyCreatedDtoOutput);

    return commandBus;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue([]);

    return queryBus;
}

function mockGroupPolicyRepositoryService() {
    const groupPolicyRepositoryService = {} as GroupPolicyRepositoryService;
    groupPolicyRepositoryService.create = jest.fn();
    groupPolicyRepositoryService.createOrUpdateById = jest.fn().mockResolvedValue(undefined);

    return groupPolicyRepositoryService;
}
