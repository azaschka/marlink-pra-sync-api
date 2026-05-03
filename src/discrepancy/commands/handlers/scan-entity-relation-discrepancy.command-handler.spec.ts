/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { RetryUtility } from '../../../shared/utilities';
import { DiscrepancyEntityType } from '../../enums';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { DiscrepancyScannerService } from '../../services/discrepancy-scanner.service';
import { DiscrepancyStrategyProviderService } from '../../services/discrepancy-strategy-provider.service';
import { DiscrepancyStrategy } from '../../types';
import { ScanEntityRelationDiscrepancyCommand } from '../scan-entity-relation-discrepancy.command';
import { ScanEntityRelationDiscrepancyCommandHandler } from './scan-entity-relation-discrepancy.command-handler';

// Shared relational comparison props: parent = groupPolicyId, child = jumpGroupId
const COMPARISON_PROPS = { parent: 'groupPolicyId', child: 'jumpGroupId' };

function rec(groupPolicyId: number, jumpGroupId: number) {
    return { groupPolicyId, jumpGroupId };
}

function makeCommand(
    overrides: Partial<{
        transactionId: string;
        tenantId: number;
        entityType: DiscrepancyEntityType;
        identicalDataIds: number[];
        onlyInExternalIds: number[];
        onlyInInternalIds: number[];
        differentDataIds: number[];
    }> = {},
): ScanEntityRelationDiscrepancyCommand {
    return new ScanEntityRelationDiscrepancyCommand(
        overrides.transactionId ?? 'txn-rel-1',
        overrides.tenantId ?? 1,
        overrides.entityType ?? DiscrepancyEntityType.GroupPolicyJumpGroup,
        overrides.identicalDataIds ?? [],
        overrides.onlyInExternalIds ?? [],
        overrides.onlyInInternalIds ?? [],
        overrides.differentDataIds ?? [],
    );
}

describe('ScanEntityRelationDiscrepancyCommandHandler', () => {
    let handler: ScanEntityRelationDiscrepancyCommandHandler;
    let appConfigService: AppConfigService;
    let discrepancyStrategyProviderService: DiscrepancyStrategyProviderService;
    let discrepancyRepositoryService: DiscrepancyRepositoryService;
    let discrepancyScannerService: DiscrepancyScannerService;
    let eventBus: EventBus;
    let mockStrategy: DiscrepancyStrategy<unknown, unknown, unknown>;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();

        appConfigService = { databaseMaxConnections: 20 } as AppConfigService;

        mockStrategy = {
            btRetrieveFunc: jest.fn(),
            dbRetrieveFunc: jest.fn(),
            btToDbEntity: jest.fn((data: unknown) => data),
            dbMarkAsSyncedFunc: jest.fn().mockResolvedValue(undefined),
            trimmedProps: [],
            relationalEntityComparisonProps: COMPARISON_PROPS,
        } as unknown as DiscrepancyStrategy<unknown, unknown, unknown>;

        discrepancyStrategyProviderService = {
            getForRelation: jest.fn().mockReturnValue(mockStrategy),
        } as unknown as DiscrepancyStrategyProviderService;

        // Default: empty pre-fetch → Map is empty → createOrUpdateById gets id: undefined
        discrepancyRepositoryService = {
            findManyByEntityTypeAndEntityId: jest.fn().mockResolvedValue([]),
            createOrUpdateById: jest.fn().mockResolvedValue(undefined),
            deleteByLastModificationDateBefore: jest.fn().mockResolvedValue(undefined),
        } as unknown as DiscrepancyRepositoryService;

        discrepancyScannerService = {
            getSyncStartDate: jest.fn().mockReturnValue(new Date('2025-11-13T10:00:00Z')),
            fetchFromBeyondTrustWithErrorHandling: jest.fn().mockResolvedValue({ transformed: [] }),
            fetchFromDatabaseWithErrorHandling: jest.fn().mockResolvedValue([]),
            analyzeRelationalDiscrepancies: jest.fn().mockReturnValue({
                identical: [],
                onlyInBt: [],
                onlyInDb: [],
                differentPairs: [],
            }),
        } as unknown as DiscrepancyScannerService;

        eventBus = { publish: jest.fn() } as unknown as EventBus;

        handler = new ScanEntityRelationDiscrepancyCommandHandler(
            appConfigService,
            discrepancyStrategyProviderService,
            discrepancyRepositoryService,
            discrepancyScannerService,
            eventBus,
        );

        jest.spyOn(RetryUtility, 'executeWithRetry').mockImplementation((fn) => fn());
    });

    describe('execute', () => {
        it('should do nothing when all parent ID arrays are empty', async () => {
            // Arrange
            const command = makeCommand();

            // Act
            await handler.execute(command);

            // Assert – loop body never entered
            expect(discrepancyStrategyProviderService.getForRelation).not.toHaveBeenCalled();
            expect(discrepancyScannerService.fetchFromBeyondTrustWithErrorHandling).not.toHaveBeenCalled();
            expect(discrepancyRepositoryService.findManyByEntityTypeAndEntityId).not.toHaveBeenCalled();
            expect(eventBus.publish).not.toHaveBeenCalled();
        });

        it('should mark identical relational data as synced and publish event with correct child IDs', async () => {
            // Arrange
            const command = makeCommand({ identicalDataIds: [10] });
            const identicalRecord = rec(10, 20);

            (discrepancyScannerService.analyzeRelationalDiscrepancies as jest.Mock).mockReturnValue({
                identical: [identicalRecord],
                onlyInBt: [],
                onlyInDb: [],
                differentPairs: [],
            });

            // Act
            await handler.execute(command);

            // Assert
            expect(mockStrategy.dbMarkAsSyncedFunc).toHaveBeenCalledTimes(1);
            expect(mockStrategy.dbMarkAsSyncedFunc).toHaveBeenCalledWith('txn-rel-1', 1, identicalRecord);
            expect(discrepancyRepositoryService.createOrUpdateById).not.toHaveBeenCalled();
            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        discrepancyOverview: expect.objectContaining({
                            entityType: DiscrepancyEntityType.GroupPolicyJumpGroup,
                            parentId: 10,
                            identicalIds: [20],
                            onlyInExternalIds: [],
                            onlyInInternalIds: [],
                            mismatchedIds: [],
                        }),
                    }),
                }),
            );
        });

        it('should save discrepancy for data only in BeyondTrust with undefined id when no existing record', async () => {
            // Arrange: no pre-fetched record → Map.get() returns undefined
            const command = makeCommand({ onlyInExternalIds: [10] });
            const btRec = rec(10, 30);

            (discrepancyScannerService.analyzeRelationalDiscrepancies as jest.Mock).mockReturnValue({
                identical: [],
                onlyInBt: [btRec],
                onlyInDb: [],
                differentPairs: [],
            });

            // Act
            await handler.execute(command);

            // Assert
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledWith(1, {
                id: undefined,
                entityType: DiscrepancyEntityType.GroupPolicyJumpGroup,
                entityId: 10,
                foreignEntityId: 30,
                internalData: undefined,
                externalData: btRec,
                lastModificationDate: expect.any(Date),
            });
        });

        it('should save discrepancy for data only in BeyondTrust using existing id from pre-fetched Map', async () => {
            // Arrange: pre-fetch returns a record with foreignEntityId=30 → id=99
            const command = makeCommand({ onlyInExternalIds: [10] });
            const btRec = rec(10, 30);

            (discrepancyRepositoryService.findManyByEntityTypeAndEntityId as jest.Mock).mockResolvedValue([
                { id: 99, entityId: 10, foreignEntityId: 30 },
            ]);
            (discrepancyScannerService.analyzeRelationalDiscrepancies as jest.Mock).mockReturnValue({
                identical: [],
                onlyInBt: [btRec],
                onlyInDb: [],
                differentPairs: [],
            });

            // Act
            await handler.execute(command);

            // Assert – Map resolves foreignEntityId 30 → id 99
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledWith(1, {
                id: 99,
                entityType: DiscrepancyEntityType.GroupPolicyJumpGroup,
                entityId: 10,
                foreignEntityId: 30,
                internalData: undefined,
                externalData: btRec,
                lastModificationDate: expect.any(Date),
            });
        });

        it('should save discrepancy for data only in Database', async () => {
            // Arrange
            const command = makeCommand({ onlyInInternalIds: [10] });
            const dbRec = rec(10, 40);

            (discrepancyScannerService.analyzeRelationalDiscrepancies as jest.Mock).mockReturnValue({
                identical: [],
                onlyInBt: [],
                onlyInDb: [dbRec],
                differentPairs: [],
            });

            // Act
            await handler.execute(command);

            // Assert
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledWith(1, {
                id: undefined,
                entityType: DiscrepancyEntityType.GroupPolicyJumpGroup,
                entityId: 10,
                foreignEntityId: 40,
                internalData: dbRec,
                externalData: undefined,
                lastModificationDate: expect.any(Date),
            });
        });

        it('should save discrepancy for mismatched data with both internal and external data', async () => {
            // Arrange
            const command = makeCommand({ differentDataIds: [10] });
            const btRec = rec(10, 50);
            const dbRec = { ...rec(10, 50), extra: 'old-value' };

            (discrepancyScannerService.analyzeRelationalDiscrepancies as jest.Mock).mockReturnValue({
                identical: [],
                onlyInBt: [],
                onlyInDb: [],
                differentPairs: [{ bt: btRec, db: dbRec }],
            });

            // Act
            await handler.execute(command);

            // Assert
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledWith(1, {
                id: undefined,
                entityType: DiscrepancyEntityType.GroupPolicyJumpGroup,
                entityId: 10,
                foreignEntityId: 50,
                internalData: dbRec,
                externalData: btRec,
                lastModificationDate: expect.any(Date),
            });
        });

        it('should process all parent IDs from all four ID arrays', async () => {
            // Arrange: one ID from each array
            const command = makeCommand({
                identicalDataIds: [10],
                onlyInExternalIds: [20],
                onlyInInternalIds: [30],
                differentDataIds: [40],
            });

            // Act
            await handler.execute(command);

            // Assert – getForRelation called for all 4 parent IDs
            expect(discrepancyStrategyProviderService.getForRelation).toHaveBeenCalledTimes(4);
            expect(discrepancyStrategyProviderService.getForRelation).toHaveBeenCalledWith(
                10,
                DiscrepancyEntityType.GroupPolicyJumpGroup,
            );
            expect(discrepancyStrategyProviderService.getForRelation).toHaveBeenCalledWith(
                40,
                DiscrepancyEntityType.GroupPolicyJumpGroup,
            );
        });

        it('should call findManyByEntityTypeAndEntityId once per parentId', async () => {
            // Arrange: 3 parent IDs across different arrays
            const command = makeCommand({ identicalDataIds: [10, 20], onlyInExternalIds: [30] });

            // Act
            await handler.execute(command);

            // Assert – one pre-fetch call per parentId, not one total
            expect(discrepancyRepositoryService.findManyByEntityTypeAndEntityId).toHaveBeenCalledTimes(3);
            expect(discrepancyRepositoryService.findManyByEntityTypeAndEntityId).toHaveBeenCalledWith(
                1,
                DiscrepancyEntityType.GroupPolicyJumpGroup,
                10,
            );
            expect(discrepancyRepositoryService.findManyByEntityTypeAndEntityId).toHaveBeenCalledWith(
                1,
                DiscrepancyEntityType.GroupPolicyJumpGroup,
                20,
            );
            expect(discrepancyRepositoryService.findManyByEntityTypeAndEntityId).toHaveBeenCalledWith(
                1,
                DiscrepancyEntityType.GroupPolicyJumpGroup,
                30,
            );
        });

        it('should publish DiscrepancyScannedEvent with correct overview per parentId', async () => {
            // Arrange
            const command = makeCommand({ onlyInExternalIds: [10] });
            const btRec = rec(10, 20);

            (discrepancyScannerService.fetchFromBeyondTrustWithErrorHandling as jest.Mock).mockResolvedValue({
                transformed: [btRec],
            });
            (discrepancyScannerService.analyzeRelationalDiscrepancies as jest.Mock).mockReturnValue({
                identical: [],
                onlyInBt: [btRec],
                onlyInDb: [],
                differentPairs: [],
            });

            // Act
            await handler.execute(command);

            // Assert
            expect(eventBus.publish).toHaveBeenCalledTimes(1);
            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        tenantId: 1,
                        discrepancyOverview: expect.objectContaining({
                            entityType: DiscrepancyEntityType.GroupPolicyJumpGroup,
                            parentId: 10,
                            totalBtData: 1,
                            totalDbData: 0,
                            onlyInExternalIds: [20],
                            identicalIds: [],
                            onlyInInternalIds: [],
                            mismatchedIds: [],
                        }),
                    }),
                }),
            );
        });

        it('should delete obsolete discrepancies after each parentId scan', async () => {
            // Arrange: 2 parent IDs → delete called twice
            const command = makeCommand({ identicalDataIds: [10, 20] });
            const startDate = new Date('2025-11-13T10:00:00Z');
            (discrepancyScannerService.getSyncStartDate as jest.Mock).mockReturnValue(startDate);

            // Act
            await handler.execute(command);

            // Assert
            expect(discrepancyRepositoryService.deleteByLastModificationDateBefore).toHaveBeenCalledTimes(2);
            expect(discrepancyRepositoryService.deleteByLastModificationDateBefore).toHaveBeenCalledWith(
                1,
                DiscrepancyEntityType.GroupPolicyJumpGroup,
                startDate,
            );
        });

        it('should continue processing other parentIds when one parentId scan fails', async () => {
            // Arrange: first parentId throws, second should still be processed
            const command = makeCommand({ identicalDataIds: [10, 20] });

            (discrepancyScannerService.fetchFromBeyondTrustWithErrorHandling as jest.Mock)
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({ transformed: [] });

            // Act
            await handler.execute(command);

            // Assert – both parentIds attempted; only second one produces delete + event
            expect(discrepancyScannerService.fetchFromBeyondTrustWithErrorHandling).toHaveBeenCalledTimes(2);
            expect(discrepancyRepositoryService.deleteByLastModificationDateBefore).toHaveBeenCalledTimes(1);
            expect(eventBus.publish).toHaveBeenCalledTimes(1);
        });

        it('should log a warning when a parentId scan fails', async () => {
            // Arrange
            const command = makeCommand({ onlyInExternalIds: [10] });

            (discrepancyScannerService.fetchFromBeyondTrustWithErrorHandling as jest.Mock).mockRejectedValue(
                new Error('Something went wrong'),
            );

            // Act
            await handler.execute(command);

            // Assert
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('⚠️ Skipping relational scan for group-policy-jump-group parent 10'),
            );
            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Something went wrong'));
        });

        it('should not throw when a parentId scan fails', async () => {
            // Arrange
            const command = makeCommand({ identicalDataIds: [10] });

            (discrepancyScannerService.fetchFromBeyondTrustWithErrorHandling as jest.Mock).mockRejectedValue(
                new Error('Unexpected error'),
            );

            // Act & Assert – error is caught by the per-parentId try/catch, not re-thrown
            await expect(handler.execute(command)).resolves.not.toThrow();
            expect(eventBus.publish).not.toHaveBeenCalled();
        });

        it('should handle complex scenario with all discrepancy types for a single parentId', async () => {
            // Arrange: one parent with all four discrepancy categories simultaneously
            const command = makeCommand({ identicalDataIds: [10] });

            const identicalRecord = rec(10, 20);
            const btOnlyRecord = rec(10, 30);
            const dbOnlyRecord = rec(10, 40);
            const mismatchedBt = rec(10, 50);
            const mismatchedDb = { ...rec(10, 50), extra: 'old-value' };

            (discrepancyScannerService.analyzeRelationalDiscrepancies as jest.Mock).mockReturnValue({
                identical: [identicalRecord],
                onlyInBt: [btOnlyRecord],
                onlyInDb: [dbOnlyRecord],
                differentPairs: [{ bt: mismatchedBt, db: mismatchedDb }],
            });

            // Act
            await handler.execute(command);

            // Assert
            expect(mockStrategy.dbMarkAsSyncedFunc).toHaveBeenCalledTimes(1);
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledTimes(3); // onlyInBt + onlyInDb + mismatch
            expect(discrepancyRepositoryService.deleteByLastModificationDateBefore).toHaveBeenCalledTimes(1);
            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        discrepancyOverview: expect.objectContaining({
                            parentId: 10,
                            identicalIds: [20],
                            onlyInExternalIds: [30],
                            onlyInInternalIds: [40],
                            mismatchedIds: [50],
                        }),
                    }),
                }),
            );
        });
    });
});
