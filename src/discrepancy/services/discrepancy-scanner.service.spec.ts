/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppConfigService } from '../../app-config/services/app-config.service';
import { DateUtility, PaginationUtility, RetryUtility } from '../../shared/utilities';
import { DiscrepancyStrategy } from '../types/discrepancy-strategy.type';
import { DiscrepancyScannerService } from './discrepancy-scanner.service';

describe('DiscrepancyScannerService', () => {
    let service: DiscrepancyScannerService;
    let appConfigService: AppConfigService;
    let mockStrategy: DiscrepancyStrategy<unknown, unknown, unknown>;

    beforeEach(() => {
        jest.clearAllMocks();

        appConfigService = {
            discrepancy: {
                maxBatchSize: 100,
            },
        } as AppConfigService;

        service = new DiscrepancyScannerService(appConfigService);

        mockStrategy = {
            btRetrieveFunc: jest.fn(),
            dbRetrieveFunc: jest.fn(),
            btToDbEntity: jest.fn((data) => data),
            trimmedProps: ['updatedAt', 'lastSyncDate'],
            btOmittedPropsForDuplicateCheck: ['timestamp'],
        } as unknown as DiscrepancyStrategy<unknown, unknown, unknown>;
    });

    describe('fetchFromBeyondTrust', () => {
        it('should fetch data from BeyondTrust API with retry logic and transform it', async () => {
            // Arrange
            const transactionId = 'txn-123';
            const tenantId = 1;
            const entityType = 'User';
            const mockBtData = [
                { id: 1, name: 'User1', updatedAt: '2025-01-01', timestamp: '123' },
                { id: 2, name: 'User2', updatedAt: '2025-01-02', timestamp: '456' },
            ];

            jest.spyOn(RetryUtility, 'delay').mockResolvedValue();
            jest.spyOn(PaginationUtility, 'queryUntilDuplicatePage').mockResolvedValue(mockBtData);
            jest.spyOn(console, 'log').mockImplementation();

            // Act
            const result = await service.fetchFromBeyondTrust(mockStrategy, transactionId, tenantId, entityType);

            // Assert
            expect(RetryUtility.delay).toHaveBeenCalledWith(10);
            expect(PaginationUtility.queryUntilDuplicatePage).toHaveBeenCalled();
            expect(result.raw).toEqual(mockBtData);
            expect(result.transformed).toHaveLength(2);
            expect(result.transformed[0]).not.toHaveProperty('updatedAt');
            expect(result.transformed[0]).not.toHaveProperty('lastSyncDate');
            expect(console.log).toHaveBeenCalledWith(`📡 Attempting BeyondTrust API call for ${entityType}...`);
            expect(console.log).toHaveBeenCalledWith(
                `✅ BeyondTrust API successful for ${entityType}, received ${mockBtData.length} records`,
            );
        });

        it('should handle empty data from BeyondTrust API', async () => {
            // Arrange
            const transactionId = 'txn-123';
            const tenantId = 1;
            const entityType = 'User';

            jest.spyOn(RetryUtility, 'delay').mockResolvedValue();
            jest.spyOn(PaginationUtility, 'queryUntilDuplicatePage').mockResolvedValue([]);
            jest.spyOn(console, 'log').mockImplementation();

            // Act
            const result = await service.fetchFromBeyondTrust(mockStrategy, transactionId, tenantId, entityType);

            // Assert
            expect(result.raw).toEqual([]);
            expect(result.transformed).toEqual([]);
        });

        it('should not retry a failed page itself (the HTTP client owns the only retry layer)', async () => {
            // Arrange
            const error = new Error('BeyondTrust GET /user failed with status 503 (UnexpectedResponse)');
            jest.spyOn(RetryUtility, 'delay').mockResolvedValue();
            (mockStrategy.btRetrieveFunc as jest.Mock).mockRejectedValue(error);
            jest.spyOn(PaginationUtility, 'queryUntilDuplicatePage').mockImplementation(async (callback) =>
                callback(1),
            );

            // Act & Assert
            await expect(service.fetchFromBeyondTrust(mockStrategy, 'txn-123', 1, 'User')).rejects.toThrow(error);
            expect(mockStrategy.btRetrieveFunc).toHaveBeenCalledTimes(1);
        });

        it('should propagate errors from BeyondTrust API', async () => {
            // Arrange
            const transactionId = 'txn-123';
            const tenantId = 1;
            const entityType = 'User';
            const error = new Error('BeyondTrust API timeout');

            jest.spyOn(RetryUtility, 'delay').mockResolvedValue();
            jest.spyOn(PaginationUtility, 'queryUntilDuplicatePage').mockRejectedValue(error);

            // Act & Assert
            await expect(
                service.fetchFromBeyondTrust(mockStrategy, transactionId, tenantId, entityType),
            ).rejects.toThrow(error);
        });
    });

    describe('fetchFromBeyondTrustWithErrorHandling', () => {
        it('should fetch data and handle 404 errors by returning empty array', async () => {
            // Arrange
            const transactionId = 'txn-123';
            const tenantId = 1;
            const error404 = new Error('404 Not Found');

            mockStrategy.btRetrieveFunc = jest.fn().mockRejectedValue(error404);

            jest.spyOn(PaginationUtility, 'queryUntilDuplicatePage').mockImplementation(async (callback) => {
                try {
                    await callback(1);
                } catch (e) {
                    // Should be caught by error handling
                }
                return [];
            });

            // Act
            const result = await service.fetchFromBeyondTrustWithErrorHandling(mockStrategy, transactionId, tenantId);

            // Assert
            expect(result.raw).toEqual([]);
            expect(result.transformed).toEqual([]);
        });

        it('should propagate non-404 errors', async () => {
            // Arrange
            const transactionId = 'txn-123';
            const tenantId = 1;
            const error = new Error('500 Internal Server Error');

            jest.spyOn(PaginationUtility, 'queryUntilDuplicatePage').mockRejectedValue(error);

            // Act & Assert
            await expect(
                service.fetchFromBeyondTrustWithErrorHandling(mockStrategy, transactionId, tenantId),
            ).rejects.toThrow(error);
        });
    });

    describe('fetchFromDatabase', () => {
        it('should fetch data from database with retry logic and transform it', async () => {
            // Arrange
            const transactionId = 'txn-123';
            const tenantId = 1;
            const entityType = 'User';
            const mockDbData = [
                { id: 1, name: 'User1', updatedAt: '2025-01-01' },
                { id: 2, name: 'User2', updatedAt: '2025-01-02' },
            ];

            jest.spyOn(RetryUtility, 'delay').mockResolvedValue();
            jest.spyOn(RetryUtility, 'executeWithRetry').mockImplementation((fn) => fn());
            jest.spyOn(PaginationUtility, 'queryUntilLastPage').mockResolvedValue(mockDbData);

            // Act
            const result = await service.fetchFromDatabase(mockStrategy, transactionId, tenantId, entityType);

            // Assert
            expect(RetryUtility.delay).toHaveBeenCalledWith(10);
            expect(RetryUtility.executeWithRetry).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0]!).not.toHaveProperty('updatedAt');
            expect(result[0]!).toHaveProperty('id');
            expect(result[0]!).toHaveProperty('name');
        });

        it('should handle empty database results', async () => {
            // Arrange
            const transactionId = 'txn-123';
            const tenantId = 1;
            const entityType = 'User';

            jest.spyOn(RetryUtility, 'delay').mockResolvedValue();
            jest.spyOn(RetryUtility, 'executeWithRetry').mockResolvedValue([]);
            jest.spyOn(PaginationUtility, 'queryUntilLastPage').mockResolvedValue([]);

            // Act
            const result = await service.fetchFromDatabase(mockStrategy, transactionId, tenantId, entityType);

            // Assert
            expect(result).toEqual([]);
        });

        it('should propagate database errors', async () => {
            // Arrange
            const transactionId = 'txn-123';
            const tenantId = 1;
            const entityType = 'User';
            const error = new Error('Database connection failed');

            jest.spyOn(RetryUtility, 'delay').mockResolvedValue();
            jest.spyOn(RetryUtility, 'executeWithRetry').mockRejectedValue(error);

            // Act & Assert
            await expect(service.fetchFromDatabase(mockStrategy, transactionId, tenantId, entityType)).rejects.toThrow(
                error,
            );
        });
    });

    describe('fetchFromDatabaseWithErrorHandling', () => {
        it('should handle NotFoundException by returning empty array', async () => {
            // Arrange
            const transactionId = 'txn-123';
            const tenantId = 1;
            const notFoundError = new Error('Not Found');
            Object.defineProperty(notFoundError.constructor, 'name', { value: 'NotFoundException' });

            mockStrategy.dbRetrieveFunc = jest.fn().mockRejectedValue(notFoundError);

            jest.spyOn(PaginationUtility, 'queryUntilLastPage').mockImplementation(async (callback) => {
                try {
                    await callback(1);
                } catch (e) {
                    // Should be caught by error handling
                }
                return [];
            });

            // Act
            const result = await service.fetchFromDatabaseWithErrorHandling(mockStrategy, transactionId, tenantId);

            // Assert
            expect(result).toEqual([]);
        });

        it('should propagate non-NotFoundException errors', async () => {
            // Arrange
            const transactionId = 'txn-123';
            const tenantId = 1;
            const error = new Error('Database connection lost');

            jest.spyOn(PaginationUtility, 'queryUntilLastPage').mockRejectedValue(error);

            // Act & Assert
            await expect(
                service.fetchFromDatabaseWithErrorHandling(mockStrategy, transactionId, tenantId),
            ).rejects.toThrow(error);
        });
    });

    describe('analyzeDiscrepancies', () => {
        it('should identify identical records', async () => {
            // Arrange
            const btData = [
                { id: 1, name: 'User1' },
                { id: 2, name: 'User2' },
            ];
            const dbData = [
                { id: 1, name: 'User1' },
                { id: 2, name: 'User2' },
            ];

            jest.spyOn(console, 'log').mockImplementation();

            // Act
            const result = service.analyzeDiscrepancies(btData, dbData);

            // Assert
            expect(result.identical).toHaveLength(2);
            expect(result.onlyInBt).toHaveLength(0);
            expect(result.onlyInDb).toHaveLength(0);
            expect(result.differentPairs).toHaveLength(0);
            expect(console.log).toHaveBeenCalledWith('🔍 Analyzing discrepancies...');
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('📊 Analysis complete'));
        });

        it('should identify records only in BeyondTrust', async () => {
            // Arrange
            const btData = [
                { id: 1, name: 'User1' },
                { id: 2, name: 'User2' },
                { id: 3, name: 'User3' },
            ];
            const dbData = [{ id: 1, name: 'User1' }];

            jest.spyOn(console, 'log').mockImplementation();

            // Act
            const result = service.analyzeDiscrepancies(btData, dbData);

            // Assert
            expect(result.identical).toHaveLength(1);
            expect(result.onlyInBt).toHaveLength(2);
            expect(result.onlyInBt[0]!.id).toBe(2);
            expect(result.onlyInBt[1]!.id).toBe(3);
            expect(result.onlyInDb).toHaveLength(0);
            expect(result.differentPairs).toHaveLength(0);
        });

        it('should identify records only in Database', async () => {
            // Arrange
            const btData = [{ id: 1, name: 'User1' }];
            const dbData = [
                { id: 1, name: 'User1' },
                { id: 4, name: 'User4' },
                { id: 5, name: 'User5' },
            ];

            jest.spyOn(console, 'log').mockImplementation();

            // Act
            const result = service.analyzeDiscrepancies(btData, dbData);

            // Assert
            expect(result.identical).toHaveLength(1);
            expect(result.onlyInBt).toHaveLength(0);
            expect(result.onlyInDb).toHaveLength(2);
            expect(result.onlyInDb[0]!.id).toBe(4);
            expect(result.onlyInDb[1]!.id).toBe(5);
            expect(result.differentPairs).toHaveLength(0);
        });

        it('should identify mismatched records with same ID', async () => {
            // Arrange
            const btData = [
                { id: 1, name: 'User1' },
                { id: 2, name: 'User2_Updated' },
            ];
            const dbData = [
                { id: 1, name: 'User1' },
                { id: 2, name: 'User2_Old' },
            ];

            jest.spyOn(console, 'log').mockImplementation();

            // Act
            const result = service.analyzeDiscrepancies(btData, dbData);

            // Assert
            expect(result.identical).toHaveLength(1);
            expect(result.onlyInBt).toHaveLength(0);
            expect(result.onlyInDb).toHaveLength(0);
            expect(result.differentPairs).toHaveLength(1);
            expect(result.differentPairs[0]!.bt.id).toBe(2);
            expect(result.differentPairs[0]!.bt.name).toBe('User2_Updated');
            expect(result.differentPairs[0]!.db.name).toBe('User2_Old');
        });

        it('should handle complex scenario with all types of discrepancies', async () => {
            // Arrange
            const btData = [
                { id: 1, name: 'User1' }, // Identical
                { id: 2, name: 'User2_New' }, // Mismatched
                { id: 3, name: 'User3' }, // Only in BT
            ];
            const dbData = [
                { id: 1, name: 'User1' }, // Identical
                { id: 2, name: 'User2_Old' }, // Mismatched
                { id: 4, name: 'User4' }, // Only in DB
            ];

            jest.spyOn(console, 'log').mockImplementation();

            // Act
            const result = service.analyzeDiscrepancies(btData, dbData);

            // Assert
            expect(result.identical).toHaveLength(1);
            expect(result.onlyInBt).toHaveLength(1);
            expect(result.onlyInBt[0]!.id).toBe(3);
            expect(result.onlyInDb).toHaveLength(1);
            expect(result.onlyInDb[0]!.id).toBe(4);
            expect(result.differentPairs).toHaveLength(1);
            expect(result.differentPairs[0]!.bt.id).toBe(2);
        });

        it('should handle empty datasets', async () => {
            // Arrange
            jest.spyOn(console, 'log').mockImplementation();

            // Act
            const result = service.analyzeDiscrepancies([], []);

            // Assert
            expect(result.identical).toHaveLength(0);
            expect(result.onlyInBt).toHaveLength(0);
            expect(result.onlyInDb).toHaveLength(0);
            expect(result.differentPairs).toHaveLength(0);
        });
    });

    describe('analyzeRelationalDiscrepancies', () => {
        it('should identify identical relational records', async () => {
            // Arrange
            const btData = [
                { groupPolicyId: 1, userId: 10, role: 'admin' },
                { groupPolicyId: 1, userId: 11, role: 'user' },
            ];
            const dbData = [
                { groupPolicyId: 1, userId: 10, role: 'admin' },
                { groupPolicyId: 1, userId: 11, role: 'user' },
            ];
            const comparisonProps = { parent: 'groupPolicyId' as const, child: 'userId' as const };

            // Act
            const result = service.analyzeRelationalDiscrepancies(btData, dbData, comparisonProps);

            // Assert
            expect(result.identical).toHaveLength(2);
            expect(result.onlyInBt).toHaveLength(0);
            expect(result.onlyInDb).toHaveLength(0);
            expect(result.differentPairs).toHaveLength(0);
        });

        it('should identify relational records only in BeyondTrust', async () => {
            // Arrange
            const btData = [
                { groupPolicyId: 1, userId: 10, role: 'admin' },
                { groupPolicyId: 1, userId: 11, role: 'user' },
                { groupPolicyId: 1, userId: 12, role: 'viewer' },
            ];
            const dbData = [{ groupPolicyId: 1, userId: 10, role: 'admin' }];
            const comparisonProps = { parent: 'groupPolicyId' as const, child: 'userId' as const };

            // Act
            const result = service.analyzeRelationalDiscrepancies(btData, dbData, comparisonProps);

            // Assert
            expect(result.identical).toHaveLength(1);
            expect(result.onlyInBt).toHaveLength(2);
            expect(result.onlyInBt[0]!.userId).toBe(11);
            expect(result.onlyInBt[1]!.userId).toBe(12);
            expect(result.onlyInDb).toHaveLength(0);
            expect(result.differentPairs).toHaveLength(0);
        });

        it('should identify relational records only in Database', async () => {
            // Arrange
            const btData = [{ groupPolicyId: 1, userId: 10, role: 'admin' }];
            const dbData = [
                { groupPolicyId: 1, userId: 10, role: 'admin' },
                { groupPolicyId: 1, userId: 13, role: 'editor' },
                { groupPolicyId: 1, userId: 14, role: 'reviewer' },
            ];
            const comparisonProps = { parent: 'groupPolicyId' as const, child: 'userId' as const };

            // Act
            const result = service.analyzeRelationalDiscrepancies(btData, dbData, comparisonProps);

            // Assert
            expect(result.identical).toHaveLength(1);
            expect(result.onlyInBt).toHaveLength(0);
            expect(result.onlyInDb).toHaveLength(2);
            expect(result.onlyInDb[0]!.userId).toBe(13);
            expect(result.onlyInDb[1]!.userId).toBe(14);
            expect(result.differentPairs).toHaveLength(0);
        });

        it('should identify mismatched relational records with same parent/child keys', async () => {
            // Arrange
            const btData = [
                { groupPolicyId: 1, userId: 10, role: 'admin' },
                { groupPolicyId: 1, userId: 11, role: 'superuser' },
            ];
            const dbData = [
                { groupPolicyId: 1, userId: 10, role: 'admin' },
                { groupPolicyId: 1, userId: 11, role: 'user' },
            ];
            const comparisonProps = { parent: 'groupPolicyId' as const, child: 'userId' as const };

            // Act
            const result = service.analyzeRelationalDiscrepancies(btData, dbData, comparisonProps);

            // Assert
            expect(result.identical).toHaveLength(1);
            expect(result.onlyInBt).toHaveLength(0);
            expect(result.onlyInDb).toHaveLength(0);
            expect(result.differentPairs).toHaveLength(1);
            expect(result.differentPairs[0]!.bt.role).toBe('superuser');
            expect(result.differentPairs[0]!.db.role).toBe('user');
        });

        it('should handle complex relational scenario with all types of discrepancies', async () => {
            // Arrange
            const btData = [
                { teamId: 5, userId: 100, status: 'active' }, // Identical
                { teamId: 5, userId: 101, status: 'pending' }, // Mismatched
                { teamId: 5, userId: 102, status: 'active' }, // Only in BT
            ];
            const dbData = [
                { teamId: 5, userId: 100, status: 'active' }, // Identical
                { teamId: 5, userId: 101, status: 'inactive' }, // Mismatched
                { teamId: 5, userId: 103, status: 'active' }, // Only in DB
            ];
            const comparisonProps = { parent: 'teamId' as const, child: 'userId' as const };

            // Act
            const result = service.analyzeRelationalDiscrepancies(btData, dbData, comparisonProps);

            // Assert
            expect(result.identical).toHaveLength(1);
            expect(result.onlyInBt).toHaveLength(1);
            expect(result.onlyInBt[0]!.userId).toBe(102);
            expect(result.onlyInDb).toHaveLength(1);
            expect(result.onlyInDb[0]!.userId).toBe(103);
            expect(result.differentPairs).toHaveLength(1);
            expect(result.differentPairs[0]!.bt.status).toBe('pending');
            expect(result.differentPairs[0]!.db.status).toBe('inactive');
        });

        it('should handle empty relational datasets', async () => {
            // Arrange
            const comparisonProps = { parent: 'groupPolicyId' as const, child: 'userId' as const };

            // Act
            const result = service.analyzeRelationalDiscrepancies([], [], comparisonProps);

            // Assert
            expect(result.identical).toHaveLength(0);
            expect(result.onlyInBt).toHaveLength(0);
            expect(result.onlyInDb).toHaveLength(0);
            expect(result.differentPairs).toHaveLength(0);
        });
    });

    describe('getSyncStartDate', () => {
        it('should return current UTC date', () => {
            // Arrange
            const mockDate = new Date('2025-11-13T10:00:00Z');
            jest.spyOn(DateUtility, 'getCurrentUtcDate').mockReturnValue(mockDate);

            // Act
            const result = service.getSyncStartDate();

            // Assert
            expect(result).toEqual(mockDate);
            expect(DateUtility.getCurrentUtcDate).toHaveBeenCalled();
        });
    });

    describe('delayBetweenCallsMs', () => {
        it('should return the constant delay value', () => {
            // Act
            const result = service.delayBetweenCallsMs;

            // Assert
            expect(result).toBe(10);
        });
    });
});
