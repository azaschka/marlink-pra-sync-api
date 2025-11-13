/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { EventBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { RetryUtility } from '../../../shared/utilities';
import { DiscrepancyEntityType } from '../../enums';
import { DiscrepancyScannedEvent } from '../../events';
import { DiscrepancyOverview } from '../../models';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { DiscrepancyScannerService } from '../../services/discrepancy-scanner.service';
import { DiscrepancyStrategyProviderService } from '../../services/discrepancy-strategy-provider.service';
import { DiscrepancyStrategy } from '../../types/discrepancy-strategy.type';
import { ScanDiscrepancyCommand } from '../scan-discrepancy.command';
import { ScanDiscrepancyCommandHandler } from './scan-discrepancy.command-handler';

describe('ScanDiscrepancyCommandHandler', () => {
    let handler: ScanDiscrepancyCommandHandler;
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

        appConfigService = {
            databaseMaxConnections: 20,
        } as AppConfigService;

        mockStrategy = {
            btRetrieveFunc: jest.fn(),
            dbRetrieveFunc: jest.fn(),
            btToDbEntity: jest.fn((data: unknown) => data),
            dbMarkAsSyncedFunc: jest.fn().mockResolvedValue(undefined),
            trimmedProps: [],
            btOmittedPropsForDuplicateCheck: [],
        } as unknown as DiscrepancyStrategy<unknown, unknown, unknown>;

        discrepancyStrategyProviderService = {
            get: jest.fn().mockReturnValue(mockStrategy),
        } as unknown as DiscrepancyStrategyProviderService;

        discrepancyRepositoryService = {
            findOneByEntityTypeAndEntityId: jest.fn().mockResolvedValue(null),
            createOrUpdateById: jest.fn().mockResolvedValue(undefined),
            deleteByLastModificationDateBefore: jest.fn().mockResolvedValue(undefined),
        } as unknown as DiscrepancyRepositoryService;

        discrepancyScannerService = {
            getSyncStartDate: jest.fn().mockReturnValue(new Date('2025-11-13T10:00:00Z')),
            fetchFromBeyondTrust: jest.fn(),
            fetchFromDatabase: jest.fn(),
            analyzeDiscrepancies: jest.fn(),
            delayBetweenCallsMs: 10,
        } as unknown as DiscrepancyScannerService;

        eventBus = {
            publish: jest.fn(),
        } as unknown as EventBus;

        handler = new ScanDiscrepancyCommandHandler(
            appConfigService,
            discrepancyStrategyProviderService,
            discrepancyRepositoryService,
            discrepancyScannerService,
            eventBus,
        );

        jest.spyOn(RetryUtility, 'delay').mockResolvedValue();
        jest.spyOn(RetryUtility, 'executeWithRetry').mockImplementation((fn) => fn());
    });

    describe('execute', () => {
        it('should successfully scan and return discrepancy overview when all data is identical', async () => {
            // Arrange
            const command = new ScanDiscrepancyCommand('txn-123', 1, DiscrepancyEntityType.User);

            const btData = [
                { id: 1, name: 'User1' },
                { id: 2, name: 'User2' },
            ];
            const dbData = [
                { id: 1, name: 'User1' },
                { id: 2, name: 'User2' },
            ];

            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockResolvedValue({
                raw: btData,
                transformed: btData,
            });
            (discrepancyScannerService.fetchFromDatabase as jest.Mock).mockResolvedValue(dbData);
            (discrepancyScannerService.analyzeDiscrepancies as jest.Mock).mockReturnValue({
                identical: btData,
                onlyInBt: [],
                onlyInDb: [],
                differentPairs: [],
            });

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(discrepancyScannerService.getSyncStartDate).toHaveBeenCalled();
            expect(discrepancyStrategyProviderService.get).toHaveBeenCalledWith(DiscrepancyEntityType.User);
            expect(discrepancyScannerService.fetchFromBeyondTrust).toHaveBeenCalledWith(
                mockStrategy,
                'txn-123',
                1,
                DiscrepancyEntityType.User,
            );
            expect(discrepancyScannerService.fetchFromDatabase).toHaveBeenCalledWith(
                mockStrategy,
                'txn-123',
                1,
                DiscrepancyEntityType.User,
            );
            expect(discrepancyScannerService.analyzeDiscrepancies).toHaveBeenCalledWith(btData, dbData);
            expect(mockStrategy.dbMarkAsSyncedFunc).toHaveBeenCalledTimes(2);
            expect(discrepancyRepositoryService.deleteByLastModificationDateBefore).toHaveBeenCalled();
            expect(eventBus.publish).toHaveBeenCalledWith(expect.any(DiscrepancyScannedEvent));
            expect(result).toEqual<DiscrepancyOverview>({
                entityType: DiscrepancyEntityType.User,
                totalBtData: 2,
                totalDbData: 2,
                identicalIds: [1, 2],
                onlyInExternalIds: [],
                onlyInInternalIds: [],
                mismatchedIds: [],
            });
        });

        it('should handle discrepancies only in BeyondTrust', async () => {
            // Arrange
            const command = new ScanDiscrepancyCommand('txn-456', 2, DiscrepancyEntityType.Team);

            const btData = [
                { id: 1, name: 'Team1' },
                { id: 2, name: 'Team2' },
                { id: 3, name: 'Team3' },
            ];
            const dbData = [{ id: 1, name: 'Team1' }];

            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockResolvedValue({
                raw: btData,
                transformed: btData,
            });
            (discrepancyScannerService.fetchFromDatabase as jest.Mock).mockResolvedValue(dbData);
            (discrepancyScannerService.analyzeDiscrepancies as jest.Mock).mockReturnValue({
                identical: [{ id: 1, name: 'Team1' }],
                onlyInBt: [
                    { id: 2, name: 'Team2' },
                    { id: 3, name: 'Team3' },
                ],
                onlyInDb: [],
                differentPairs: [],
            });

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledTimes(2);
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledWith(2, {
                id: undefined,
                entityType: DiscrepancyEntityType.Team,
                entityId: 2,
                internalData: undefined,
                externalData: { id: 2, name: 'Team2' },
                lastModificationDate: expect.any(Date),
            });
            expect(result.onlyInExternalIds).toEqual([2, 3]);
            expect(result.onlyInInternalIds).toEqual([]);
        });

        it('should handle discrepancies only in Database', async () => {
            // Arrange
            const command = new ScanDiscrepancyCommand('txn-789', 3, DiscrepancyEntityType.GroupPolicy);

            const btData = [{ id: 1, name: 'Policy1' }];
            const dbData = [
                { id: 1, name: 'Policy1' },
                { id: 4, name: 'Policy4' },
                { id: 5, name: 'Policy5' },
            ];

            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockResolvedValue({
                raw: btData,
                transformed: btData,
            });
            (discrepancyScannerService.fetchFromDatabase as jest.Mock).mockResolvedValue(dbData);
            (discrepancyScannerService.analyzeDiscrepancies as jest.Mock).mockReturnValue({
                identical: [{ id: 1, name: 'Policy1' }],
                onlyInBt: [],
                onlyInDb: [
                    { id: 4, name: 'Policy4' },
                    { id: 5, name: 'Policy5' },
                ],
                differentPairs: [],
            });

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledTimes(2);
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledWith(3, {
                id: undefined,
                entityType: DiscrepancyEntityType.GroupPolicy,
                entityId: 4,
                internalData: { id: 4, name: 'Policy4' },
                externalData: undefined,
                lastModificationDate: expect.any(Date),
            });
            expect(result.onlyInExternalIds).toEqual([]);
            expect(result.onlyInInternalIds).toEqual([4, 5]);
        });

        it('should handle mismatched data between BeyondTrust and Database', async () => {
            // Arrange
            const command = new ScanDiscrepancyCommand('txn-999', 4, DiscrepancyEntityType.JumpClient);

            const btData = [
                { id: 1, name: 'Client1' },
                { id: 2, name: 'Client2_Updated' },
            ];
            const dbData = [
                { id: 1, name: 'Client1' },
                { id: 2, name: 'Client2_Old' },
            ];

            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockResolvedValue({
                raw: btData,
                transformed: btData,
            });
            (discrepancyScannerService.fetchFromDatabase as jest.Mock).mockResolvedValue(dbData);
            (discrepancyScannerService.analyzeDiscrepancies as jest.Mock).mockReturnValue({
                identical: [{ id: 1, name: 'Client1' }],
                onlyInBt: [],
                onlyInDb: [],
                differentPairs: [
                    {
                        bt: { id: 2, name: 'Client2_Updated' },
                        db: { id: 2, name: 'Client2_Old' },
                    },
                ],
            });

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledTimes(1);
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledWith(4, {
                id: undefined,
                entityType: DiscrepancyEntityType.JumpClient,
                entityId: 2,
                internalData: { id: 2, name: 'Client2_Old' },
                externalData: { id: 2, name: 'Client2_Updated' },
                lastModificationDate: expect.any(Date),
            });
            expect(result.mismatchedIds).toEqual([2]);
        });

        it('should handle complex scenario with all types of discrepancies', async () => {
            // Arrange
            const command = new ScanDiscrepancyCommand('txn-complex', 5, DiscrepancyEntityType.Jumpoint);

            const btData = [
                { id: 1, name: 'Point1' },
                { id: 2, name: 'Point2_New' },
                { id: 3, name: 'Point3' },
            ];
            const dbData = [
                { id: 1, name: 'Point1' },
                { id: 2, name: 'Point2_Old' },
                { id: 4, name: 'Point4' },
            ];

            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockResolvedValue({
                raw: btData,
                transformed: btData,
            });
            (discrepancyScannerService.fetchFromDatabase as jest.Mock).mockResolvedValue(dbData);
            (discrepancyScannerService.analyzeDiscrepancies as jest.Mock).mockReturnValue({
                identical: [{ id: 1, name: 'Point1' }],
                onlyInBt: [{ id: 3, name: 'Point3' }],
                onlyInDb: [{ id: 4, name: 'Point4' }],
                differentPairs: [
                    {
                        bt: { id: 2, name: 'Point2_New' },
                        db: { id: 2, name: 'Point2_Old' },
                    },
                ],
            });

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(mockStrategy.dbMarkAsSyncedFunc).toHaveBeenCalledTimes(1);
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledTimes(3); // 1 onlyInBt + 1 onlyInDb + 1 mismatch
            expect(result).toEqual<DiscrepancyOverview>({
                entityType: DiscrepancyEntityType.Jumpoint,
                totalBtData: 3,
                totalDbData: 3,
                identicalIds: [1],
                onlyInExternalIds: [3],
                onlyInInternalIds: [4],
                mismatchedIds: [2],
            });
        });

        it('should handle BeyondTrust API errors gracefully for connectivity issues', async () => {
            // Arrange
            const command = new ScanDiscrepancyCommand('txn-error', 6, DiscrepancyEntityType.User);
            const error = new Error('ECONNRESET: Connection reset by peer');

            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockRejectedValue(error);

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('❌ Error scanning'), error.message);
            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('⚠️ Skipping entity'));
            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: {
                        tenantId: 6,
                        discrepancyOverview: expect.objectContaining({
                            entityType: DiscrepancyEntityType.User,
                            totalBtData: 0,
                            totalDbData: 0,
                        }),
                    },
                }),
            );
            expect(result.totalBtData).toBe(0);
        });

        it('should handle timeout errors gracefully', async () => {
            // Arrange
            const command = new ScanDiscrepancyCommand('txn-timeout', 7, DiscrepancyEntityType.Team);
            const error = new Error('Request timeout after 30000ms');

            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockRejectedValue(error);

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('❌ Error scanning'), error.message);
            expect(result).toEqual<DiscrepancyOverview>({
                entityType: DiscrepancyEntityType.Team,
                totalBtData: 0,
                totalDbData: 0,
                identicalIds: [],
                onlyInExternalIds: [],
                onlyInInternalIds: [],
                mismatchedIds: [],
            });
        });

        it('should handle 502 Bad Gateway errors gracefully', async () => {
            // Arrange
            const command = new ScanDiscrepancyCommand('txn-502', 8, DiscrepancyEntityType.GroupPolicy);
            const error = new Error('502 Bad Gateway');

            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockRejectedValue(error);

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(result.totalBtData).toBe(0);
            expect(result.totalDbData).toBe(0);
        });

        it('should re-throw non-API connectivity errors', async () => {
            // Arrange
            const command = new ScanDiscrepancyCommand('txn-fatal', 9, DiscrepancyEntityType.User);
            const error = new Error('Database constraint violation');

            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockResolvedValue({
                raw: [],
                transformed: [],
            });
            (discrepancyScannerService.fetchFromDatabase as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(error);
        });

        it('should handle existing discrepancies when saving', async () => {
            // Arrange
            const command = new ScanDiscrepancyCommand('txn-existing', 10, DiscrepancyEntityType.User);
            const existingDiscrepancy = { id: 100 };

            const btData = [{ id: 1, name: 'User1' }];
            const dbData: unknown[] = [];

            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockResolvedValue({
                raw: btData,
                transformed: btData,
            });
            (discrepancyScannerService.fetchFromDatabase as jest.Mock).mockResolvedValue(dbData);
            (discrepancyScannerService.analyzeDiscrepancies as jest.Mock).mockReturnValue({
                identical: [],
                onlyInBt: btData,
                onlyInDb: [],
                differentPairs: [],
            });
            (discrepancyRepositoryService.findOneByEntityTypeAndEntityId as jest.Mock).mockResolvedValue(
                existingDiscrepancy,
            );

            // Act
            await handler.execute(command);

            // Assert
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledWith(10, {
                id: 100,
                entityType: DiscrepancyEntityType.User,
                entityId: 1,
                internalData: undefined,
                externalData: { id: 1, name: 'User1' },
                lastModificationDate: expect.any(Date),
            });
        });

        it('should delete obsolete discrepancies after scan', async () => {
            // Arrange
            const command = new ScanDiscrepancyCommand('txn-cleanup', 11, DiscrepancyEntityType.Team);
            const startDate = new Date('2025-11-13T10:00:00Z');

            (discrepancyScannerService.getSyncStartDate as jest.Mock).mockReturnValue(startDate);
            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockResolvedValue({
                raw: [],
                transformed: [],
            });
            (discrepancyScannerService.fetchFromDatabase as jest.Mock).mockResolvedValue([]);
            (discrepancyScannerService.analyzeDiscrepancies as jest.Mock).mockReturnValue({
                identical: [],
                onlyInBt: [],
                onlyInDb: [],
                differentPairs: [],
            });

            // Act
            await handler.execute(command);

            // Assert
            expect(discrepancyRepositoryService.deleteByLastModificationDateBefore).toHaveBeenCalledWith(
                11,
                DiscrepancyEntityType.Team,
                startDate,
            );
        });

        it('should use pLimit for concurrent database operations', async () => {
            // Arrange
            const command = new ScanDiscrepancyCommand('txn-concurrent', 12, DiscrepancyEntityType.User);

            const manyRecords = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `User${i + 1}` }));

            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockResolvedValue({
                raw: manyRecords,
                transformed: manyRecords,
            });
            (discrepancyScannerService.fetchFromDatabase as jest.Mock).mockResolvedValue([]);
            (discrepancyScannerService.analyzeDiscrepancies as jest.Mock).mockReturnValue({
                identical: [],
                onlyInBt: manyRecords,
                onlyInDb: [],
                differentPairs: [],
            });

            // Act
            await handler.execute(command);

            // Assert
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledTimes(50);
            // pLimit should control concurrency (hard to test directly, but operations should complete)
        });
    });
});
