import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { GroupPolicyCreatedDtoOutput } from '../../dtos/outputs';
import { AccessPermissionStatusType } from '../../enums';
import { CreateGroupPolicyCommand } from '../create-group-policy.command';
import { CreateGroupPolicyCommandHandler } from './create-group-policy.command-handler';

abstract class TestHelper {
    public static get mockedGroupPolicyCreatedDtoOutput(): GroupPolicyCreatedDtoOutput {
        return {
            name: 'group-policy-1',
            id: 1,
            permAccessAllowed: false,
            accessPermStatus: AccessPermissionStatusType.Final,
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
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateGroupPolicyCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateGroupPolicyCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateGroupPolicyCommand(
                    'transaction-1',
                    123,
                    'group-policy-1',
                    true,
                    AccessPermissionStatusType.Final,
                    true,
                    true,
                    1800,
                    true,
                    true,
                    true,
                    false,
                    true,
                    true,
                    false,
                    true,
                    true,
                    false,
                    true,
                    true,
                    true,
                    11,
                    12,
                    13,
                    14,
                ),
                expectedHttpClientBody: {
                    name: 'group-policy-1',
                    permAccessAllowed: true,
                    accessPermStatus: AccessPermissionStatusType.Final,
                    permShareOtherTeam: true,
                    permInviteExternalUser: true,
                    permSessionIdleTimeout: 1800,
                    permExtendedAvailabilityModeAllowed: true,
                    permEditExternalKey: true,
                    permCollaborate: true,
                    permCollaborateControl: false,
                    permJumpClient: true,
                    permLocalJump: true,
                    permRemoteJump: false,
                    permRemoteVnc: true,
                    permRemoteRdp: true,
                    permShellJump: false,
                    permWebJump: true,
                    permProtocolTunnel: true,
                    permSdStaticPortForExternalTools: true,
                    defaultJumpItemRoleId: 11,
                    privateJumpItemRoleId: 12,
                    inferiorJumpItemRoleId: 13,
                    unassignedJumpItemRoleId: 14,
                },
            },
            {
                command: new CreateGroupPolicyCommand('transaction-2', 123, 'group-policy-2', false),
                expectedHttpClientBody: {
                    name: 'group-policy-2',
                    permAccessAllowed: false,
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    command.transactionId,
                    123,
                    '/group-policy',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedGroupPolicyCreatedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedGroupPolicyCreatedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    groupPolicy: {
                        path: 'group-policy',
                    },
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
