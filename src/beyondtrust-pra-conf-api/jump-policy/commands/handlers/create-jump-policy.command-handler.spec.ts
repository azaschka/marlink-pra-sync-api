import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpPolicyCreatedDtoOutput } from '../../dtos/outputs';
import {
    ApprovalApproverScopeType,
    ApprovalScopeType,
    SimultaneousJumpsRdpType,
    SimultaneousJumpsType,
} from '../../enums';
import { CreateJumpPolicyCommand } from '../create-jump-policy.command';
import { CreateJumpPolicyCommandHandler } from './create-jump-policy.command-handler';

abstract class TestHelper {
    public static get mockedJumpPolicyCreatedDtoOutput(): JumpPolicyCreatedDtoOutput {
        return {
            id: 1,
            displayName: 'jump-policy-1',
        };
    }
}

describe('CreateJumpPolicyCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateJumpPolicyCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateJumpPolicyCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateJumpPolicyCommand(
                    'transaction-1',
                    123,
                    'jump-policy-1',
                    'jump-policy-code-1',
                    'jump-policy-description-1',
                    true,
                    SimultaneousJumpsType.Global,
                    true,
                    SimultaneousJumpsRdpType.NewSession,
                    false,
                    true,
                    false,
                    true,
                    false,
                    ['email1@example.com', 'email2@example.com'],
                    'notif-display',
                    'en',
                    true,
                    120,
                    ApprovalScopeType.Anyone,
                    ['approval1@example.com'],
                    ['user1', 'user2'],
                    ['team1', 'team2'],
                    'approval-display',
                    'fr',
                    ApprovalApproverScopeType.Anyone,
                    true,
                ),
                expectedHttpClientBody: {
                    displayName: 'jump-policy-1',
                    codeName: 'jump-policy-code-1',
                    description: 'jump-policy-description-1',
                    scheduleEnabled: true,
                    simultaneousJumps: SimultaneousJumpsType.Global,
                    simultaneousJumpBehaviorAppliesToCopies: true,
                    simultaneousJumpsRdp: SimultaneousJumpsRdpType.NewSession,
                    scheduleStrict: false,
                    ticketIdRequired: true,
                    twoFactorChallengeRequired: false,
                    sessionStartNotification: true,
                    sessionEndNotification: false,
                    notificationEmailAddresses: ['email1@example.com', 'email2@example.com'],
                    notificationDisplayName: 'notif-display',
                    notificationEmailLanguage: 'en',
                    approvalRequired: true,
                    approvalMaxDuration: 120,
                    approvalScope: ApprovalScopeType.Anyone,
                    approvalEmailAddresses: ['approval1@example.com'],
                    approvalUserIds: ['user1', 'user2'],
                    approvalTeamIds: ['team1', 'team2'],
                    approvalDisplayName: 'approval-display',
                    approvalEmailLanguage: 'fr',
                    approvalApproverScope: ApprovalApproverScopeType.Anyone,
                    recordingsDisabled: true,
                },
            },
            {
                command: new CreateJumpPolicyCommand('transaction-2', 123, 'jump-policy-2'),
                expectedHttpClientBody: {
                    displayName: 'jump-policy-2',
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
                    '/jump-policy',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedJumpPolicyCreatedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedJumpPolicyCreatedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpPolicy: {
                        path: 'jump-policy',
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
