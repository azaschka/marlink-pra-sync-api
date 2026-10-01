import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { DiscrepancyDtoOutput, DiscrepancyOverviewDtoOutput } from '../dtos/outputs';
import { DiscrepancyEntityType, DiscrepancyScanState } from '../enums';
import { DiscrepancyScannerController } from './discrepancy-scanner.controller';

// Mock RetryUtility
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('../../shared/utilities', () => ({
    ...jest.requireActual('../../shared/utilities'),
    RetryUtility: {
        delay: jest.fn().mockResolvedValue(undefined),
        executeWithRetry: jest.fn((operation: () => Promise<unknown>) => operation()),
    },
}));

describe('DiscrepancyScannerController', () => {
    let commandBus: CommandBus;
    let queryBus: QueryBus;
    let controller: DiscrepancyScannerController;

    beforeEach(() => {
        // Mock console.log and console.error to prevent cluttering the test output
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.clearAllMocks();
        commandBus = mockCommandBus();
        queryBus = mockQueryBus();
        controller = new DiscrepancyScannerController(queryBus, commandBus, {
            discrepancy: { scan: { cycleBudgetInMs: 60000 } },
        } as AppConfigService);
    });

    describe('scanAllDiscrepancies', () => {
        it('should attempt to scan discrepancies for all entity types', async () => {
            const mockOverview: DiscrepancyOverviewDtoOutput = {
                entityType: DiscrepancyEntityType.User,
                totalBtData: 10,
                totalDbData: 10,
                identicalIds: [1, 2, 3],
                onlyInExternalIds: [],
                onlyInInternalIds: [],
                mismatchedIds: [],
            };

            const scanDiscrepanciesSpy = jest.spyOn(controller, 'scanDiscrepancies').mockResolvedValue(mockOverview);

            await controller.scanAllDiscrepancies('transaction-id-1', 123);

            expect(scanDiscrepanciesSpy).toHaveBeenCalledTimes(14);
        });

        const overview = (
            entityType: DiscrepancyEntityType,
            state: DiscrepancyScanState,
            failureKind?: string,
        ): DiscrepancyOverviewDtoOutput => ({
            entityType,
            totalBtData: 0,
            totalDbData: 0,
            identicalIds: [],
            onlyInExternalIds: [],
            onlyInInternalIds: [],
            mismatchedIds: [],
            state,
            failureKind,
        });

        it('should skip the remaining types after 3 consecutive types failed because the instance is unavailable', async () => {
            const scanDiscrepanciesSpy = jest
                .spyOn(controller, 'scanDiscrepancies')
                .mockImplementation((_tx, _tenant, entityType) =>
                    Promise.resolve(overview(entityType, DiscrepancyScanState.Failed, 'NotFound')),
                );
            jest.spyOn(console, 'warn').mockImplementation(() => {});

            const results = await controller.scanAllDiscrepancies('transaction-id-1', 123);

            expect(scanDiscrepanciesSpy).toHaveBeenCalledTimes(3);
            expect(results).toHaveLength(14);
            expect(results.slice(3).every((r) => r.state === DiscrepancyScanState.Skipped)).toBe(true);
            expect(results[3]?.failureKind).toBe('InstanceUnavailable');
        });

        it('should not open the breaker for failures that are not consecutive or not about availability', async () => {
            const states: [DiscrepancyScanState, string | undefined][] = [
                [DiscrepancyScanState.Failed, 'UnexpectedResponse'],
                [DiscrepancyScanState.Failed, 'Transient'],
                [DiscrepancyScanState.Succeeded, undefined],
                [DiscrepancyScanState.Failed, 'ClientError'],
                [DiscrepancyScanState.Failed, 'Database'],
                [DiscrepancyScanState.Failed, 'NotFound'],
            ];
            const scanDiscrepanciesSpy = jest
                .spyOn(controller, 'scanDiscrepancies')
                .mockImplementation((_tx, _tenant, entityType) => {
                    const [state, kind] = states.shift() ?? [DiscrepancyScanState.Succeeded, undefined];

                    return Promise.resolve(overview(entityType, state, kind));
                });

            await controller.scanAllDiscrepancies('transaction-id-1', 123);

            expect(scanDiscrepanciesSpy).toHaveBeenCalledTimes(14);
        });

        it('should log start and finish with the same scan ID and only celebrate when everything succeeded', async () => {
            jest.spyOn(controller, 'scanDiscrepancies').mockImplementation((_tx, _tenant, entityType) =>
                Promise.resolve(
                    entityType === DiscrepancyEntityType.Team
                        ? overview(entityType, DiscrepancyScanState.Failed, 'UnexpectedResponse')
                        : overview(entityType, DiscrepancyScanState.Succeeded),
                ),
            );

            await controller.scanAllDiscrepancies('transaction-id-1', 123);

            const lines = ((console.log as jest.Mock).mock.calls as unknown[][]).map((call) => String(call[0]));
            const started = lines.find((line) => line.includes(' started '));
            const finished = lines.find((line) => line.includes(' finished: '));
            const scanId = /\[scan ([^\]]+)\]/.exec(started ?? '')?.[1];
            expect(scanId).toBeDefined();
            expect(finished).toContain(`[scan ${scanId}] tenant 123 finished: 13 succeeded, 0 partial, 1 failed`);
            expect(finished).toContain('UnexpectedResponse x1');
            expect(finished?.startsWith('⚠️')).toBe(true);
        });
    });

    describe('scanDiscrepancies', () => {
        it('should execute the ScanDiscrepancyCommand with correct parameters', async () => {
            const expectedOverview = {} as DiscrepancyOverviewDtoOutput;
            const commandBusExecuteSpy = jest.spyOn(commandBus, 'execute').mockResolvedValue(expectedOverview);

            const result = await controller.scanDiscrepancies(
                'transaction-id-2',
                456,
                DiscrepancyEntityType.GroupPolicy,
            );

            expect(result).toBe(expectedOverview);
            expect(commandBusExecuteSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-id-2',
                    tenantId: 456,
                    entityType: DiscrepancyEntityType.GroupPolicy,
                }),
            );
        });
    });

    describe('retrieveDiscrepancies', () => {
        it('should execute the RetrieveDiscrepanciesQuery with correct parameters', async () => {
            const expectedDiscrepancies = [] as DiscrepancyDtoOutput[];
            const queryBusExecuteSpy = jest.spyOn(queryBus, 'execute').mockResolvedValue(expectedDiscrepancies);

            const result = await controller.retrieveDiscrepancies('transaction-id', 123, {
                entityId: 1001,
                entityType: DiscrepancyEntityType.JumpGroup,
                pageSize: 25,
                pageNumber: 2,
            });

            expect(result).toBe(expectedDiscrepancies);
            expect(queryBusExecuteSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-id',
                    tenantId: 123,
                    pageSize: 25,
                    pageNumber: 2,
                    entityType: DiscrepancyEntityType.JumpGroup,
                    entityId: 1001,
                }),
            );
        });
    });
});

function mockCommandBus() {
    const commandBus = {} as CommandBus;

    commandBus.execute = jest.fn();

    return commandBus;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;

    queryBus.execute = jest.fn();

    return queryBus;
}
