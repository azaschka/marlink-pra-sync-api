import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { GroupPolicyModifiedDtoOutput } from '../../dtos/outputs';
import { AccessPermissionStatusType } from '../../enums';
import { ModifyGroupPolicyCommand } from '../modify-group-policy.command';
import { ModifyGroupPolicyCommandHandler } from './modify-group-policy.command-handler';

abstract class TestHelper {
    public static get mockedGroupPolicyModifiedDtoOutput(): GroupPolicyModifiedDtoOutput {
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

describe('ModifyGroupPolicyCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: ModifyGroupPolicyCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new ModifyGroupPolicyCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new ModifyGroupPolicyCommand(
                    'transaction-1',
                    1,
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
                command: new ModifyGroupPolicyCommand('transaction-2', 2, 'group-policy-2', false),
                expectedHttpClientBody: {
                    name: 'group-policy-2',
                    permAccessAllowed: false,
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePatchMethod = jest.spyOn(httpClientService, 'patch');

                const result = await handler.execute(command);

                expect(httpClientServicePatchMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    `https://api.example.com/group-policy/${command.id}`,
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedGroupPolicyModifiedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.patch = jest.fn().mockResolvedValue(TestHelper.mockedGroupPolicyModifiedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                groupPolicy: {
                    path: 'group-policy',
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
