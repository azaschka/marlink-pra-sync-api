import { SortOrderType } from '../../shared/enums';
import { Log } from '../models';
import { LogService } from '../services/log.service';
import { LogController } from './log.controller';

const DEFAULT_DATE_TIME = new Date('2025-12-01T00:00:00Z');

describe('LogController', () => {
    let controller: LogController;
    let logService: LogService;

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(DEFAULT_DATE_TIME.getTime());
        logService = mockLogService();
        controller = new LogController(logService);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('retrieveLogs', () => {
        it('should call the log service retrieve and count logs and return the result', async () => {
            const expectedTotalCounts = 123;
            const expectedLogs = [{ actionName: 'test-action-1' }] as Log[];
            const logServiceRetrieveLogsMethod = jest.spyOn(logService, 'retrieveLogs').mockResolvedValue(expectedLogs);
            const logServiceCountLogsMethod = jest
                .spyOn(logService, 'countLogs')
                .mockResolvedValue(expectedTotalCounts);

            const result = await controller.retrieveLogs({
                pageSize: 10,
                pageNumber: 1,
                creationDateFrom: new Date('2023-01-01T00:00:00Z'),
                creationDateTo: new Date('2023-01-31T23:59:59Z'),
                sortOrderType: SortOrderType.Descending,
            });

            expect(logServiceRetrieveLogsMethod).toHaveBeenCalledWith(
                10,
                1,
                new Date('2023-01-01T00:00:00Z'),
                new Date('2023-01-31T23:59:59Z'),
                SortOrderType.Descending,
            );
            expect(logServiceCountLogsMethod).toHaveBeenCalledWith(
                new Date('2023-01-01T00:00:00Z'),
                new Date('2023-01-31T23:59:59Z'),
            );
            expect(result).toStrictEqual({
                logs: expectedLogs,
                totalCount: expectedTotalCounts,
            });
        });
    });

    describe('clearLogs', () => {
        it.each([
            {
                input: {
                    creationDateFrom: new Date('2025-01-01T00:00:00Z'),
                    creationDateTo: new Date('2025-01-31T23:59:59Z'),
                },
                expectedFrom: new Date('2025-01-01T00:00:00Z'),
                expectedTo: new Date('2025-01-31T23:59:59Z'),
            },
            {
                input: {
                    creationDateFrom: new Date('2025-01-01T00:00:00Z'),
                },
                expectedFrom: new Date('2025-01-01T00:00:00Z'),
                expectedTo: DEFAULT_DATE_TIME,
            },
        ])(
            'should call log service clear logs with the correct parameters',
            async ({ input, expectedFrom, expectedTo }) => {
                const logServiceClearLogsMethod = jest.spyOn(logService, 'clearLogs').mockResolvedValue();

                await controller.clearLogs(input);

                expect(logServiceClearLogsMethod).toHaveBeenCalledWith(expectedFrom, expectedTo);
            },
        );
    });
});

function mockLogService() {
    const logService = {} as LogService;
    logService.retrieveLogs = jest.fn();
    logService.countLogs = jest.fn();
    logService.clearLogs = jest.fn();

    return logService;
}
