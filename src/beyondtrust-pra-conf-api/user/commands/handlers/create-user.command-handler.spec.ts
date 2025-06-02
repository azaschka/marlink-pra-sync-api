import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { UserCreatedDtoOutput } from '../../dtos/outputs';
import {
    UserAllowedAccessPermissionType,
    UserViewSupportReportsPermissionType,
    UserViewVaultReportsPermissionType,
} from '../../enums';
import { CreateUserCommand } from '../create-user.command';
import { CreateUserCommandHandler } from './create-user.command-handler';

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
            permViewSupportReports: UserViewSupportReportsPermissionType.AllSessions,
            permViewVaultReports: UserViewVaultReportsPermissionType.NotAllowed,
            permViewSyslogReports: true,
            permViewSdRecordings: false,
            permEditJumpGroups: false,
            permEditSdTeams: false,
            permEditCannedScripts: false,
            permEditCustomRepLinks: false,
            permAccessAllowed: UserAllowedAccessPermissionType.FullSupport,
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

describe('CreateUserCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateUserCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateUserCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateUserCommand(
                    'transaction-1',
                    'display-name-1',
                    'user-1',
                    'password-1',
                    null,
                    'email-1',
                    'en',
                    false,
                    true,
                    0,
                    false,
                ),
                expectedHttpClientBody: {
                    publicDisplayName: 'display-name-1',
                    username: 'user-1',
                    password: 'password-1',
                    passwordExpiration: null,
                    emailAddress: 'email-1',
                    preferredEmailLanguage: 'en',
                    twoFactorRequired: false,
                    enabled: true,
                    failedLogins: 0,
                    passwordResetNextLogin: false,
                },
            },
            {
                command: new CreateUserCommand('transaction-2', 'display-name-2', 'user-2'),
                expectedHttpClientBody: {
                    publicDisplayName: 'display-name-2',
                    username: 'user-2',
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/user',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedUserCreatedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedUserCreatedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                user: {
                    path: 'user',
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
