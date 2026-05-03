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

        // findManyByEntityType replaces the old findOneByEntityTypeAndEntityId pattern.
        // Default: empty array → Map is empty → all createOrUpdateById calls get id: undefined.
        discrepancyRepositoryService = {
            findManyByEntityType: jest.fn().mockResolvedValue([]),
            createOrUpdateById: jest.fn().mockResolvedValue(undefined),
            deleteByLastModificationDateBefore: jest.fn().mockResolvedValue(undefined),
        } as unknown as DiscrepancyRepositoryService;

        discrepancyScannerService = {
            getSyncStartDate: jest.fn().mockReturnValue(new Date('2025-11-13T10:00:00Z')),
            fetchFromBeyondTrust: jest.fn(),
            fetchFromDatabase: jest.fn(),
            analyzeDiscrepancies: jest.fn(),
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
            expect(discrepancyRepositoryService.findManyByEntityType).toHaveBeenCalledWith(
                1,
                DiscrepancyEntityType.User,
            );
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

        it('should use existing discrepancy id from pre-fetched Map when saving', async () => {
            // Arrange: findManyByEntityType returns an existing record for entityId=1 with id=100.
            // The Map lookup replaces the old per-item findOneByEntityTypeAndEntityId call.
            const command = new ScanDiscrepancyCommand('txn-existing', 10, DiscrepancyEntityType.User);

            const btData = [{ id: 1, name: 'User1' }];

            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockResolvedValue({
                raw: btData,
                transformed: btData,
            });
            (discrepancyScannerService.fetchFromDatabase as jest.Mock).mockResolvedValue([]);
            (discrepancyScannerService.analyzeDiscrepancies as jest.Mock).mockReturnValue({
                identical: [],
                onlyInBt: btData,
                onlyInDb: [],
                differentPairs: [],
            });
            (discrepancyRepositoryService.findManyByEntityType as jest.Mock).mockResolvedValue([
                { entityId: 1, id: 100 },
            ]);

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

        it('should resolve existing ids via Map for both onlyInDb and differentPairs', async () => {
            // Arrange: two existing records – one for a DB-only entity, one for a mismatched entity.
            const command = new ScanDiscrepancyCommand('txn-map-test', 1, DiscrepancyEntityType.User);

            (discrepancyRepositoryService.findManyByEntityType as jest.Mock).mockResolvedValue([
                { entityId: 5, id: 200 },
                { entityId: 6, id: 300 },
            ]);

            (discrepancyScannerService.fetchFromBeyondTrust as jest.Mock).mockResolvedValue({
                raw: [{ id: 5, name: 'User5_Updated' }],
                transformed: [{ id: 5, name: 'User5_Updated' }],
            });
            (discrepancyScannerService.fetchFromDatabase as jest.Mock).mockResolvedValue([
                { id: 5, name: 'User5_Old' },
                { id: 6, name: 'User6' },
            ]);
            (discrepancyScannerService.analyzeDiscrepancies as jest.Mock).mockReturnValue({
                identical: [],
                onlyInBt: [],
                onlyInDb: [{ id: 6, name: 'User6' }],
                differentPairs: [
                    {
                        bt: { id: 5, name: 'User5_Updated' },
                        db: { id: 5, name: 'User5_Old' },
                    },
                ],
            });

            // Act
            await handler.execute(command);

            // Assert – differentPairs uses id: 200, onlyInDb uses id: 300
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledWith(1, {
                id: 200,
                entityType: DiscrepancyEntityType.User,
                entityId: 5,
                internalData: { id: 5, name: 'User5_Old' },
                externalData: { id: 5, name: 'User5_Updated' },
                lastModificationDate: expect.any(Date),
            });
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledWith(1, {
                id: 300,
                entityType: DiscrepancyEntityType.User,
                entityId: 6,
                internalData: { id: 6, name: 'User6' },
                externalData: undefined,
                lastModificationDate: expect.any(Date),
            });
        });

        it('should call findManyByEntityType exactly once per scan regardless of discrepancy count', async () => {
            // Arrange: 30 discrepancies – the pre-fetch must happen once, not once per item.
            const command = new ScanDiscrepancyCommand('txn-once', 1, DiscrepancyEntityType.User);

            const manyRecords = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `User${i + 1}` }));
            const existingDiscrepancies = manyRecords.map((r) => ({ entityId: r.id, id: r.id + 1000 }));

            (discrepancyRepositoryService.findManyByEntityType as jest.Mock).mockResolvedValue(existingDiscrepancies);
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

            // Assert: one pre-fetch, not 30
            expect(discrepancyRepositoryService.findManyByEntityType).toHaveBeenCalledTimes(1);
            expect(discrepancyRepositoryService.findManyByEntityType).toHaveBeenCalledWith(
                1,
                DiscrepancyEntityType.User,
            );
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledTimes(30);
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

            // Assert – all 50 operations complete regardless of concurrency limit
            expect(discrepancyRepositoryService.createOrUpdateById).toHaveBeenCalledTimes(50);
        });
    });
});
