import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand as BTCreateUserCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import { UserCreatedDtoOutput, UserRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import {
    UserAllowedAccessPermissionType as BTUserAllowedAccessPermissionType,
    UserEndpointAutomationPermissionType as BTUserEndpointAutomationPermissionType,
    UserViewSupportReportsPermissionType as BTUserViewSupportReportsPermissionType,
    UserViewVaultReportsPermissionType as BTUserViewVaultReportsPermissionType,
} from '../../../beyondtrust-pra-conf-api/user/enums';
import { RetrieveUsersQuery as BTRetrieveUsersQuery } from '../../../beyondtrust-pra-conf-api/user/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserCreatedEvent, UserCreationFailedEvent } from '../../events';
import { UserEntity } from '../../repositories/entities';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { CreateUserCommand } from '../create-user.command';
import { CreateUserCommandHandler } from './create-user.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTUserViewSupportReportsPermissionType: jest
        .fn()
        .mockImplementation((type: BTUserViewSupportReportsPermissionType) => type),
    mapFromBTUserViewVaultReportsPermissionType: jest
        .fn()
        .mockImplementation((type: BTUserViewSupportReportsPermissionType) => type),
    mapFromBTUserAllowedAccessPermissionType: jest
        .fn()
        .mockImplementation((type: BTUserViewSupportReportsPermissionType) => type),
    mapFromBTUserEndpointAutomationPermissionType: jest
        .fn()
        .mockImplementation((type: BTUserEndpointAutomationPermissionType) => type),
}));

abstract class TestHelper {
    public static get mockedUserCreatedDtoOutput(): UserCreatedDtoOutput {
        return {
            publicDisplayName: 'display-name-1',
            id: 1,
            securityProviderId: 1,
            username: 'user-1',
            passwordExpiration: new Date('2025-10-01T00:00:00Z'),
            emailAddress: 'email-1',
            preferredEmailLanguage: 'en',
            twoFactorRequired: false,
            enabled: true,
            lastAuthentication: new Date('2025-10-01T00:00:00Z'),
            failedLogins: 0,
            passwordResetNextLogin: false,
            createdAt: new Date('2025-10-01T00:00:00Z'),
            twoFactorEnabled: false,
            fido2CredentialCount: 0,
            fido2LastUsedDate: new Date('2025-10-01T00:00:00Z'),
            permAdmin: false,
            permSetPasswords: false,
            permAdminPushagents: false,
            permViewSupportReports: BTUserViewSupportReportsPermissionType.AllSessions,
            permViewVaultReports: BTUserViewVaultReportsPermissionType.NotAllowed,
            permViewSyslogReports: true,
            permViewSdRecordings: false,
            permEditJumpGroups: false,
            permEditSdTeams: false,
            permEditCannedScripts: false,
            permEditCustomRepLinks: false,
            permAccessAllowed: BTUserAllowedAccessPermissionType.FullSupport,
            permShareOtherTeam: false,
            permInviteExternalUser: true,
            permExtendedAvailabilityModeAllowed: true,
            permEditExternalKey: false,
            permSessionIdleTimeout: 20,
            permCollaborate: false,
            permCollaborateControl: false,
            permJumpClient: false,
            permLocalJump: false,
            permRemoteJump: false,
            permRemoteVnc: false,
            permRemoteRdp: false,
            permShellJump: false,
            defaultJumpItemRoleId: 1,
            privateJumpItemRoleId: 2,
            inferiorJumpItemRoleId: 3,
            unassignedJumpItemRoleId: 4,
            permWebJump: false,
            permProtocolTunnel: false,
            permSdStaticPortForExternalTools: false,
            permVault: false,
            permEndpointAutomation: BTUserEndpointAutomationPermissionType.NotAllowed,
        };
    }
}

describe('CreateUserCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let userRepositoryService: UserRepositoryService;
    let handler: CreateUserCommandHandler;

    let queryBus: QueryBus;

    beforeEach(() => {
        commandBus = mockCommandBus();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        userRepositoryService = mockUserRepositoryService();
        handler = new CreateUserCommandHandler(commandBus, queryBus, eventBus, userRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <CreateUserCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                publicDisplayName: 'display-name-1',
                username: 'user-1',
                password: 'password-1',
                passwordExpirationDate: null,
                email: 'email-1',
                preferredEmailLanguage: 'en',
                isTwoFactorAuthRequired: false,
                isLoginAllowed: true,
                failedLoginAttempts: 0,
                mustResetPasswordOnNextLogin: false,
            },
            <CreateUserCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                publicDisplayName: 'display-name-2',
                username: 'user-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const userEntityToBeCreated = { id: 123 } as UserEntity;
                const userEntityCreateMethod = jest.spyOn(UserEntity, 'create').mockReturnValue(userEntityToBeCreated);

                const expectedResult = { id: 321 } as UserEntity;
                const userRepositoryServiceCreateMethod = jest
                    .spyOn(userRepositoryService, 'create')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateUserCommand(
                        command.transactionId,
                        command.tenantId,
                        command.publicDisplayName,
                        command.username,
                        command.password,
                        command.passwordExpirationDate,
                        command.email,
                        command.preferredEmailLanguage,
                        command.isTwoFactorAuthRequired,
                        command.isLoginAllowed,
                        command.failedLoginAttempts,
                        command.mustResetPasswordOnNextLogin,
                    ),
                );
                expect(userEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedUserCreatedDtoOutput.id,
                    TestHelper.mockedUserCreatedDtoOutput.publicDisplayName,
                    TestHelper.mockedUserCreatedDtoOutput.securityProviderId,
                    TestHelper.mockedUserCreatedDtoOutput.username,
                    TestHelper.mockedUserCreatedDtoOutput.passwordExpiration,
                    TestHelper.mockedUserCreatedDtoOutput.emailAddress,
                    TestHelper.mockedUserCreatedDtoOutput.preferredEmailLanguage,
                    TestHelper.mockedUserCreatedDtoOutput.twoFactorRequired,
                    TestHelper.mockedUserCreatedDtoOutput.enabled,
                    TestHelper.mockedUserCreatedDtoOutput.lastAuthentication,
                    TestHelper.mockedUserCreatedDtoOutput.failedLogins,
                    TestHelper.mockedUserCreatedDtoOutput.passwordResetNextLogin,
                    TestHelper.mockedUserCreatedDtoOutput.createdAt,
                    TestHelper.mockedUserCreatedDtoOutput.twoFactorEnabled,
                    TestHelper.mockedUserCreatedDtoOutput.fido2CredentialCount,
                    TestHelper.mockedUserCreatedDtoOutput.fido2LastUsedDate,
                    TestHelper.mockedUserCreatedDtoOutput.permAdmin,
                    TestHelper.mockedUserCreatedDtoOutput.permSetPasswords,
                    TestHelper.mockedUserCreatedDtoOutput.permAdminPushagents,
                    TestHelper.mockedUserCreatedDtoOutput.permViewSupportReports,
                    TestHelper.mockedUserCreatedDtoOutput.permViewVaultReports,
                    TestHelper.mockedUserCreatedDtoOutput.permViewSyslogReports,
                    TestHelper.mockedUserCreatedDtoOutput.permViewSdRecordings,
                    TestHelper.mockedUserCreatedDtoOutput.permEditJumpGroups,
                    TestHelper.mockedUserCreatedDtoOutput.permEditSdTeams,
                    TestHelper.mockedUserCreatedDtoOutput.permEditCannedScripts,
                    TestHelper.mockedUserCreatedDtoOutput.permEditCustomRepLinks,
                    TestHelper.mockedUserCreatedDtoOutput.permAccessAllowed,
                    TestHelper.mockedUserCreatedDtoOutput.permShareOtherTeam,
                    TestHelper.mockedUserCreatedDtoOutput.permInviteExternalUser,
                    TestHelper.mockedUserCreatedDtoOutput.permExtendedAvailabilityModeAllowed,
                    TestHelper.mockedUserCreatedDtoOutput.permEditExternalKey,
                    TestHelper.mockedUserCreatedDtoOutput.permSessionIdleTimeout,
                    TestHelper.mockedUserCreatedDtoOutput.permCollaborate,
                    TestHelper.mockedUserCreatedDtoOutput.permCollaborateControl,
                    TestHelper.mockedUserCreatedDtoOutput.permJumpClient,
                    TestHelper.mockedUserCreatedDtoOutput.permLocalJump,
                    TestHelper.mockedUserCreatedDtoOutput.permRemoteJump,
                    TestHelper.mockedUserCreatedDtoOutput.permRemoteVnc,
                    TestHelper.mockedUserCreatedDtoOutput.permRemoteRdp,
                    TestHelper.mockedUserCreatedDtoOutput.permShellJump,
                    TestHelper.mockedUserCreatedDtoOutput.defaultJumpItemRoleId,
                    TestHelper.mockedUserCreatedDtoOutput.privateJumpItemRoleId,
                    TestHelper.mockedUserCreatedDtoOutput.inferiorJumpItemRoleId,
                    TestHelper.mockedUserCreatedDtoOutput.unassignedJumpItemRoleId,
                    TestHelper.mockedUserCreatedDtoOutput.permWebJump,
                    TestHelper.mockedUserCreatedDtoOutput.permProtocolTunnel,
                    TestHelper.mockedUserCreatedDtoOutput.permSdStaticPortForExternalTools,
                    TestHelper.mockedUserCreatedDtoOutput.permVault,
                    TestHelper.mockedUserCreatedDtoOutput.permEndpointAutomation,
                );
                expect(userRepositoryServiceCreateMethod).toHaveBeenCalledWith(123, userEntityToBeCreated);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<UserCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: UserCreatedEvent.EVENT_TYPE,
                        payload: {
                            user: result,
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
                handler.execute(<CreateUserCommand>{
                    transactionId: 'transaction-1',
                    tenantId: 123,
                    publicDisplayName: 'display-name-1',
                    username: 'user-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should fetch existing user from BeyondTrust and upsert to local DB when BT returns 422 name-already-taken', async () => {
            // Arrange
            const nameAlreadyTakenError = new HttpException({}, HttpStatus.UNPROCESSABLE_ENTITY);

            const existingBtUser: UserRetrievedDtoOutput = {
                ...TestHelper.mockedUserCreatedDtoOutput,
                id: 999,
                username: 'user-1',
            };

            // commandBus: first call (BTCreateUserCommand) rejects; queryBus (BTRetrieveUsersQuery) resolves
            jest.spyOn(commandBus, 'execute').mockRejectedValue(nameAlreadyTakenError);
            const queryBusExecuteMethod = jest.spyOn(queryBus, 'execute').mockResolvedValue([existingBtUser]);

            const userEntityToBeCreated = { id: 999, username: 'user-1' } as UserEntity;
            jest.spyOn(UserEntity, 'create').mockReturnValue(userEntityToBeCreated);

            const createOrUpdateByIdMethod = jest
                .spyOn(userRepositoryService, 'createOrUpdateById')
                .mockResolvedValue(undefined);

            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

            // Act
            const result = await handler.execute(<CreateUserCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                publicDisplayName: 'display-name-1',
                username: 'user-1',
            });

            // Assert
            expect(queryBusExecuteMethod).toHaveBeenCalledWith(
                new BTRetrieveUsersQuery('transaction-1', 123, 1, 1, undefined, 'user-1'),
            );
            expect(createOrUpdateByIdMethod).toHaveBeenCalledWith(123, userEntityToBeCreated);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: UserCreatedEvent.EVENT_TYPE,
                }),
            );
            expect(result).toBe(userEntityToBeCreated);
        });

        it('should rethrow 422 if user cannot be found after name-already-taken', async () => {
            // Arrange
            const nameAlreadyTakenError = new HttpException({}, HttpStatus.UNPROCESSABLE_ENTITY);

            jest.spyOn(commandBus, 'execute').mockRejectedValue(nameAlreadyTakenError);
            jest.spyOn(queryBus, 'execute').mockResolvedValue([]);

            // Act & Assert
            await expect(
                handler.execute(<CreateUserCommand>{
                    transactionId: 'transaction-1',
                    tenantId: 123,
                    publicDisplayName: 'display-name-1',
                    username: 'user-1',
                }),
            ).rejects.toThrow(nameAlreadyTakenError);
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const userEntityToBeCreated = { publicDisplayName: 'user-1', id: 123 } as UserEntity;
            const userEntityCreateMethod = jest.spyOn(UserEntity, 'create').mockReturnValue(userEntityToBeCreated);
            const expectedError = new Error('Error');
            const userRepositoryServiceCreateMethod = jest
                .spyOn(userRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CreateUserCommand>{
                    transactionId: 'transaction-1',
                    publicDisplayName: 'user-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(userEntityCreateMethod).toHaveBeenCalled();
            expect(userRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: UserCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        user: userEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedUserCreatedDtoOutput);

    return commandBus;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue([]);

    return queryBus;
}

function mockUserRepositoryService() {
    const userRepositoryService = {} as UserRepositoryService;
    userRepositoryService.create = jest.fn();
    userRepositoryService.createOrUpdateById = jest.fn().mockResolvedValue(undefined);

    return userRepositoryService;
}
