import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { CreateBackupCommand } from '../create-backup.command';
import { CreateBackupCommandHandler } from './create-backup.command-handler';

describe('CreateBackupCommandHandler', () => {
    let httpClientService: { postToFile: jest.Mock };
    let handler: CreateBackupCommandHandler;

    beforeEach(() => {
        httpClientService = { postToFile: jest.fn().mockResolvedValue({ bytes: 42 }) };
        handler = new CreateBackupCommandHandler(
            { beyondTrust: { api: { backup: { path: '/backup' } } } } as AppConfigService,
            httpClientService as unknown as HttpClientService,
        );
    });

    it.each([
        {
            command: new CreateBackupCommand('transaction-1', 123, 'password-1', '/storage/backups/a.nsb'),
            expectedBody: { password: 'password-1' },
        },
        {
            command: new CreateBackupCommand('transaction-2', 123, undefined, '/storage/backups/b.nsb'),
            expectedBody: {},
        },
    ])('streams the backup into the target file', async ({ command, expectedBody }) => {
        const result = await handler.execute(command);

        expect(httpClientService.postToFile).toHaveBeenCalledWith(
            command.transactionId,
            command.beyondtrustInstanceId,
            '/backup',
            expect.objectContaining(expectedBody),
            command.targetFilePath,
        );
        expect(result).toEqual({ bytes: 42 });
    });
});
