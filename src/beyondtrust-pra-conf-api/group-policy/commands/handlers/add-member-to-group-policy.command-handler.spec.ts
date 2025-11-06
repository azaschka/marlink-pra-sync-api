import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { MemberAddedToGroupPolicyDtoOutput } from '../../dtos/outputs';
import { AddMemberToGroupPolicyCommand } from '../add-member-to-group-policy.command';
import { AddMemberToGroupPolicyCommandHandler } from './add-member-to-group-policy.command-handler';

abstract class TestHelper {
    public static get mockedMemberAddedToGroupPolicyDtoOutput(): MemberAddedToGroupPolicyDtoOutput {
        return {
            id: 1,
            userId: 2,
            securityProviderId: 3,
        };
    }
}

describe('AddMemberToGroupPolicyCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: AddMemberToGroupPolicyCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new AddMemberToGroupPolicyCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new AddMemberToGroupPolicyCommand(
                    'transaction-1',
                    123,
                    1,
                    2,
                    3,
                    'distinguished-name',
                    'group-name',
                ),
                expectedHttpClientBody: {
                    userId: 2,
                    securityProviderId: 3,
                    distinguishedName: 'distinguished-name',
                    groupName: 'group-name',
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'transaction-1',
                    123,
                    '/group-policy/1/member',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedMemberAddedToGroupPolicyDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedMemberAddedToGroupPolicyDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    groupPolicy: {
                        path: 'group-policy',
                        member: {
                            path: 'member',
                        },
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
