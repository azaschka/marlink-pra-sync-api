import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyUserCommand as BTModifyUserCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import { UserModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import {
    UserAllowedAccessPermissionType as BTUserAllowedAccessPermissionType,
    UserViewSupportReportsPermissionType as BTUserViewSupportReportsPermissionType,
    UserViewVaultReportsPermissionType as BTUserViewVaultReportsPermissionType,
} from '../../../beyondtrust-pra-conf-api/user/enums';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserModificationFailedEvent, UserModifiedEvent } from '../../events';
import { UserEntity } from '../../repositories/entities';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { ModifyUserCommand } from '../modify-user.command';
import { ModifyUserCommandHandler } from './modify-user.command-handler';

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
}));

abstract class TestHelper {
    public static get mockedUserModifiedDtoOutput(): UserModifiedDtoOutput {
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
            permEndpointAutomation: false,
        };
    }
}

describe('ModifyUserCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let userRepositoryService: UserRepositoryService;
    let handler: ModifyUserCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        userRepositoryService = mockUserRepositoryService();
        handler = new ModifyUserCommandHandler(commandBus, eventBus, userRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <ModifyUserCommand>{
                transactionId: 'transaction-1',
                id: 123,
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
            <ModifyUserCommand>{
                transactionId: 'transaction-2',
                id: 456,
                publicDisplayName: 'display-name-2',
                username: 'user-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const userEntityToBeUpdated = { id: 123 } as UserEntity;
                const userEntityCreateMethod = jest.spyOn(UserEntity, 'create').mockReturnValue(userEntityToBeUpdated);

                const expectedResult = { id: 321 } as UserEntity;
                const userRepositoryServiceCreateOrUpdateByIdMethod = jest
                    .spyOn(userRepositoryService, 'createOrUpdateById')
                    .mockResolvedValue(Promise.resolve());
                const userRepositoryServiceFindByIdMethod = jest
                    .spyOn(userRepositoryService, 'findOneById')
                    .mockResolvedValue(Promise.resolve(expectedResult));

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyUserCommand(
                        command.transactionId,
                        command.id,
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
                    TestHelper.mockedUserModifiedDtoOutput.id,
                    TestHelper.mockedUserModifiedDtoOutput.publicDisplayName,
                    TestHelper.mockedUserModifiedDtoOutput.securityProviderId,
                    TestHelper.mockedUserModifiedDtoOutput.username,
                    TestHelper.mockedUserModifiedDtoOutput.passwordExpiration,
                    TestHelper.mockedUserModifiedDtoOutput.emailAddress,
                    TestHelper.mockedUserModifiedDtoOutput.preferredEmailLanguage,
                    TestHelper.mockedUserModifiedDtoOutput.twoFactorRequired,
                    TestHelper.mockedUserModifiedDtoOutput.enabled,
                    TestHelper.mockedUserModifiedDtoOutput.lastAuthentication,
                    TestHelper.mockedUserModifiedDtoOutput.failedLogins,
                    TestHelper.mockedUserModifiedDtoOutput.passwordResetNextLogin,
                    TestHelper.mockedUserModifiedDtoOutput.createdAt,
                    TestHelper.mockedUserModifiedDtoOutput.twoFactorEnabled,
                    TestHelper.mockedUserModifiedDtoOutput.fido2CredentialCount,
                    TestHelper.mockedUserModifiedDtoOutput.fido2LastUsedDate,
                    TestHelper.mockedUserModifiedDtoOutput.permAdmin,
                    TestHelper.mockedUserModifiedDtoOutput.permSetPasswords,
                    TestHelper.mockedUserModifiedDtoOutput.permAdminPushagents,
                    TestHelper.mockedUserModifiedDtoOutput.permViewSupportReports,
                    TestHelper.mockedUserModifiedDtoOutput.permViewVaultReports,
                    TestHelper.mockedUserModifiedDtoOutput.permViewSyslogReports,
                    TestHelper.mockedUserModifiedDtoOutput.permViewSdRecordings,
                    TestHelper.mockedUserModifiedDtoOutput.permEditJumpGroups,
                    TestHelper.mockedUserModifiedDtoOutput.permEditSdTeams,
                    TestHelper.mockedUserModifiedDtoOutput.permEditCannedScripts,
                    TestHelper.mockedUserModifiedDtoOutput.permEditCustomRepLinks,
                    TestHelper.mockedUserModifiedDtoOutput.permAccessAllowed,
                    TestHelper.mockedUserModifiedDtoOutput.permShareOtherTeam,
                    TestHelper.mockedUserModifiedDtoOutput.permInviteExternalUser,
                    TestHelper.mockedUserModifiedDtoOutput.permExtendedAvailabilityModeAllowed,
                    TestHelper.mockedUserModifiedDtoOutput.permEditExternalKey,
                    TestHelper.mockedUserModifiedDtoOutput.permSessionIdleTimeout,
                    TestHelper.mockedUserModifiedDtoOutput.permCollaborate,
                    TestHelper.mockedUserModifiedDtoOutput.permCollaborateControl,
                    TestHelper.mockedUserModifiedDtoOutput.permJumpClient,
                    TestHelper.mockedUserModifiedDtoOutput.permLocalJump,
                    TestHelper.mockedUserModifiedDtoOutput.permRemoteJump,
                    TestHelper.mockedUserModifiedDtoOutput.permRemoteVnc,
                    TestHelper.mockedUserModifiedDtoOutput.permRemoteRdp,
                    TestHelper.mockedUserModifiedDtoOutput.permShellJump,
                    TestHelper.mockedUserModifiedDtoOutput.defaultJumpItemRoleId,
                    TestHelper.mockedUserModifiedDtoOutput.privateJumpItemRoleId,
                    TestHelper.mockedUserModifiedDtoOutput.inferiorJumpItemRoleId,
                    TestHelper.mockedUserModifiedDtoOutput.unassignedJumpItemRoleId,
                    TestHelper.mockedUserModifiedDtoOutput.permWebJump,
                    TestHelper.mockedUserModifiedDtoOutput.permProtocolTunnel,
                    TestHelper.mockedUserModifiedDtoOutput.permSdStaticPortForExternalTools,
                    TestHelper.mockedUserModifiedDtoOutput.permVault,
                    TestHelper.mockedUserModifiedDtoOutput.permEndpointAutomation,
                );
                expect(userRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(userEntityToBeUpdated);
                expect(userRepositoryServiceFindByIdMethod).toHaveBeenCalledWith(userEntityToBeUpdated.id);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<UserModifiedEvent>{
                        transactionId: command.transactionId,
                        eventType: UserModifiedEvent.EVENT_TYPE,
                        payload: {
                            user: result,
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
                handler.execute(<ModifyUserCommand>{
                    transactionId: 'transaction-1',
                    id: 123,
                    publicDisplayName: 'display-name-1',
                    username: 'user-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error if the user retrieval from repository returns null', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const userEntityToBeCreated = { publicDisplayName: 'user-1', id: 123 } as UserEntity;
            const userEntityCreateMethod = jest.spyOn(UserEntity, 'create').mockReturnValue(userEntityToBeCreated);
            const userRepositoryServiceCreateOrUpdateByIdMethod = jest.spyOn(
                userRepositoryService,
                'createOrUpdateById',
            );
            const userRepositoryServiceFindByIdMethod = jest
                .spyOn(userRepositoryService, 'findOneById')
                .mockResolvedValue(null);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyUserCommand>{
                    transactionId: 'transaction-1',
                    publicDisplayName: 'user-1',
                }),
            ).rejects.toThrow();
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(userEntityCreateMethod).toHaveBeenCalled();
            expect(userRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(userRepositoryServiceFindByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalled();
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: UserModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        user: userEntityToBeCreated,
                    },
                }),
            );
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const userEntityToBeCreated = { publicDisplayName: 'user-1', id: 123 } as UserEntity;
            const userEntityCreateMethod = jest.spyOn(UserEntity, 'create').mockReturnValue(userEntityToBeCreated);
            const expectedError = new Error('Error');
            const userRepositoryServiceCreateOrUpdateByIdMethod = jest
                .spyOn(userRepositoryService, 'createOrUpdateById')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyUserCommand>{
                    transactionId: 'transaction-1',
                    id: 123,
                    publicDisplayName: 'user-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(userEntityCreateMethod).toHaveBeenCalled();
            expect(userRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: UserModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        user: userEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedUserModifiedDtoOutput);

    return commandBus;
}

function mockUserRepositoryService() {
    const userRepositoryService = {} as UserRepositoryService;
    userRepositoryService.createOrUpdateById = jest.fn();
    userRepositoryService.findOneById = jest.fn();

    return userRepositoryService;
}
