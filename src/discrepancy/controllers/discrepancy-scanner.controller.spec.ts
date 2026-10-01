import { BadRequestException, ConflictException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { DiscrepancyDtoOutput } from '../dtos/outputs';
import { DiscrepancyEntityType, DiscrepancyScanState } from '../enums';
import { DiscrepancyOverview } from '../models';
import { DiscrepancyScanCycleService } from '../services/discrepancy-scan-cycle.service';
import { DiscrepancyScannerController } from './discrepancy-scanner.controller';

describe('DiscrepancyScannerController', () => {
    let queryBus: QueryBus;
    let cycleService: { runCycle: jest.Mock; scanType: jest.Mock };
    let controller: DiscrepancyScannerController;

    const overview: DiscrepancyOverview = {
        entityType: DiscrepancyEntityType.User,
        totalBtData: 10,
        totalDbData: 10,
        identicalIds: [1, 2, 3],
        onlyInExternalIds: [],
        onlyInInternalIds: [],
        mismatchedIds: [],
        state: DiscrepancyScanState.Succeeded,
    };

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        queryBus = mockQueryBus();
        cycleService = { runCycle: jest.fn(), scanType: jest.fn() };
        controller = new DiscrepancyScannerController(queryBus, cycleService as unknown as DiscrepancyScanCycleService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('scanAllDiscrepancies', () => {
        it('should run a manual cycle and return its overviews', async () => {
            cycleService.runCycle.mockResolvedValue({ status: 'completed', scanId: 'abc', overviews: [overview] });

            await expect(controller.scanAllDiscrepancies('transaction-id-1', 123)).resolves.toEqual([overview]);
            expect(cycleService.runCycle).toHaveBeenCalledWith('transaction-id-1', 123, 'manual');
        });

        it('should answer 409 with the running scan ID while a cycle is active for the tenant', async () => {
            cycleService.runCycle.mockResolvedValue({
                status: 'skipped',
                reason: 'cycle 1a2b3c4d (cron) active since 2026-10-01T10:00:00.000Z',
                activeScanId: '1a2b3c4d',
            });

            const error = await controller.scanAllDiscrepancies('transaction-id-1', 123).catch((e: unknown) => e);

            expect(error).toBeInstanceOf(ConflictException);
            expect((error as ConflictException).getResponse()).toEqual(expect.objectContaining({ scanId: '1a2b3c4d' }));
        });
    });

    describe('scanDiscrepancies', () => {
        it('should scan through the cycle service, which joins a scan already in flight', async () => {
            cycleService.scanType.mockResolvedValue(overview);

            const result = await controller.scanDiscrepancies(
                'transaction-id-2',
                456,
                DiscrepancyEntityType.GroupPolicy,
            );

            expect(result).toBe(overview);
            expect(cycleService.scanType).toHaveBeenCalledWith(
                'transaction-id-2',
                456,
                DiscrepancyEntityType.GroupPolicy,
            );
        });

        it('should reject an unknown entity type', async () => {
            await expect(
                controller.scanDiscrepancies('transaction-id-2', 456, 'unknown' as DiscrepancyEntityType),
            ).rejects.toBeInstanceOf(BadRequestException);
            expect(cycleService.scanType).not.toHaveBeenCalled();
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

function mockQueryBus() {
    const queryBus = {} as QueryBus;

    queryBus.execute = jest.fn();

    return queryBus;
}
