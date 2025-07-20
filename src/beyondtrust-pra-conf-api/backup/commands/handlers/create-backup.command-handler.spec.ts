import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { CreateBackupCommand } from '../create-backup.command';
import { CreateBackupCommandHandler } from './create-backup.command-handler';

abstract class TestHelper {
    public static get mockedFileBuffer(): Buffer {
        return Buffer.from(
            JSON.stringify({
                sometthing: 'mocked data',
            }),
        );
    }
}

describe('CreateBackupCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateBackupCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateBackupCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateBackupCommand('transaction-1', 'password-1'),
                expectedHttpClientBody: {
                    password: 'password-1',
                },
            },
            {
                command: new CreateBackupCommand('transaction-2'),
                expectedHttpClientBody: {},
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/backup',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedFileBuffer);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedFileBuffer);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            backup: {
                apiUrl: 'https://api.example.com/backup',
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
