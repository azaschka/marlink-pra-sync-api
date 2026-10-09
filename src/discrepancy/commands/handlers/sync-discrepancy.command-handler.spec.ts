/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { QueryFailedError } from 'typeorm';
import { RetryUtility } from '../../../shared/utilities';
import { DiscrepancyEntityType, DiscrepancySyncType } from '../../enums';
import { DiscrepancyResolvedEvent } from '../../events';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { DiscrepancyEntity } from '../../repositories/entities';
import { DiscrepancyStrategyProviderService } from '../../services/discrepancy-strategy-provider.service';
import { SyncDiscrepancyCommand } from '../sync-discrepancy.command';
import { SyncDiscrepancyCommandHandler } from './sync-discrepancy.command-handler';

const TENANT_ID = 1;
const DISCREPANCY_ID = 42;
const TRANSACTION_ID = 'test-tx-id';

function makeQueryFailedError(message: string): QueryFailedError {
    return new QueryFailedError('INSERT INTO ...', [], new Error(message));
}

describe('SyncDiscrepancyCommandHandler', () => {
    let handler: SyncDiscrepancyCommandHandler;
    let discrepancyStrategyProviderService: DiscrepancyStrategyProviderService;
    let discrepancyRepositoryService: DiscrepancyRepositoryService;
    let eventBus: EventBus;

    const mockStrategy = {
        dbCreateOrUpdateFunc: jest.fn(),
        dbDeleteFunc: jest.fn(),
        btCreateFunc: jest.fn(),
        btModifyFunc: jest.fn(),
        btDeleteFunc: jest.fn(),
    };

    const mockDiscrepancy = {
        id: DISCREPANCY_ID,
        entityType: DiscrepancyEntityType.GroupPolicyMember,
        entityId: 99,
        externalData: { id: 99, userId: undefined, securityProviderId: 1, groupName: 'LDAP-Group' },
        internalData: undefined,
        creationDate: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Bypass retry delays so tests run fast
        jest.spyOn(RetryUtility, 'executeWithRetry').mockImplementation((fn) => fn());

        discrepancyStrategyProviderService = {
            get: jest.fn().mockReturnValue(mockStrategy),
            getForRelation: jest.fn().mockReturnValue(mockStrategy),
        } as unknown as DiscrepancyStrategyProviderService;

        discrepancyRepositoryService = {
            findOneById: jest.fn().mockResolvedValue(mockDiscrepancy),
            deleteById: jest.fn().mockResolvedValue(undefined),
        } as unknown as DiscrepancyRepositoryService;

        eventBus = {
            publish: jest.fn(),
        } as unknown as EventBus;

        handler = new SyncDiscrepancyCommandHandler(
            discrepancyStrategyProviderService,
            discrepancyRepositoryService,
            eventBus,
        );
    });

    describe('execute', () => {
        describe('happy path – ExternalToInternal with externalData', () => {
            it('should create/update DB record, delete discrepancy and publish resolved event', async () => {
                mockStrategy.dbCreateOrUpdateFunc.mockResolvedValue(undefined);

                await handler.execute(
                    new SyncDiscrepancyCommand(
                        TRANSACTION_ID,
                        TENANT_ID,
                        DISCREPANCY_ID,
                        DiscrepancySyncType.ExternalToInternal,
                    ),
                );

                expect(mockStrategy.dbCreateOrUpdateFunc).toHaveBeenCalledWith(TENANT_ID, mockDiscrepancy.externalData);
                expect(discrepancyRepositoryService.deleteById).toHaveBeenCalledWith(TENANT_ID, DISCREPANCY_ID);
                expect(eventBus.publish).toHaveBeenCalledWith(expect.any(DiscrepancyResolvedEvent));
            });
        });

        describe('happy path – ExternalToInternal without externalData (delete from DB)', () => {
            it('should delete the DB record, delete discrepancy and publish resolved event', async () => {
                const discrepancyOnlyInInternal = {
                    ...mockDiscrepancy,
                    externalData: undefined,
                    internalData: { id: 99 },
                };
                jest.spyOn(discrepancyRepositoryService, 'findOneById').mockResolvedValue(
                    discrepancyOnlyInInternal as unknown as DiscrepancyEntity,
                );
                mockStrategy.dbDeleteFunc.mockResolvedValue(undefined);

                await handler.execute(
                    new SyncDiscrepancyCommand(
                        TRANSACTION_ID,
                        TENANT_ID,
                        DISCREPANCY_ID,
                        DiscrepancySyncType.ExternalToInternal,
                    ),
                );

                expect(mockStrategy.dbDeleteFunc).toHaveBeenCalledWith(
                    TENANT_ID,
                    discrepancyOnlyInInternal.internalData,
                );
                expect(discrepancyRepositoryService.deleteById).toHaveBeenCalledWith(TENANT_ID, DISCREPANCY_ID);
                expect(eventBus.publish).toHaveBeenCalledWith(expect.any(DiscrepancyResolvedEvent));
            });
        });

        describe('discrepancy not found', () => {
            it('should throw NotFoundException', async () => {
                jest.spyOn(discrepancyRepositoryService, 'findOneById').mockResolvedValue(null);

                await expect(
                    handler.execute(
                        new SyncDiscrepancyCommand(
                            TRANSACTION_ID,
                            TENANT_ID,
                            DISCREPANCY_ID,
                            DiscrepancySyncType.ExternalToInternal,
                        ),
                    ),
                ).rejects.toThrow(NotFoundException);
            });
        });

        describe('Fix B – permanent DB schema constraint failures', () => {
            it('should auto-delete and NOT rethrow when error contains "doesn\'t have a default value"', async () => {
                const permanentError = makeQueryFailedError("Field 'user_id' doesn't have a default value");
                mockStrategy.dbCreateOrUpdateFunc.mockRejectedValue(permanentError);

                const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
                const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

                await expect(
                    handler.execute(
                        new SyncDiscrepancyCommand(
                            TRANSACTION_ID,
                            TENANT_ID,
                            DISCREPANCY_ID,
                            DiscrepancySyncType.ExternalToInternal,
                        ),
                    ),
                ).resolves.toBeUndefined();

                expect(discrepancyRepositoryService.deleteById).toHaveBeenCalledWith(TENANT_ID, DISCREPANCY_ID);
                expect(eventBus.publish).not.toHaveBeenCalled();
                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    expect.stringContaining('permanent schema constraint failure'),
                );

                consoleWarnSpy.mockRestore();
                consoleErrorSpy.mockRestore();
            });

            it('should auto-delete and NOT rethrow when error contains "cannot be null"', async () => {
                const permanentError = makeQueryFailedError("Column 'some_column' cannot be null");
                mockStrategy.dbCreateOrUpdateFunc.mockRejectedValue(permanentError);

                jest.spyOn(console, 'warn').mockImplementation(() => undefined);
                jest.spyOn(console, 'error').mockImplementation(() => undefined);

                await expect(
                    handler.execute(
                        new SyncDiscrepancyCommand(
                            TRANSACTION_ID,
                            TENANT_ID,
                            DISCREPANCY_ID,
                            DiscrepancySyncType.ExternalToInternal,
                        ),
                    ),
                ).resolves.toBeUndefined();

                expect(discrepancyRepositoryService.deleteById).toHaveBeenCalledWith(TENANT_ID, DISCREPANCY_ID);
                expect(eventBus.publish).not.toHaveBeenCalled();
            });

            it('should still auto-delete even when the deleteById call itself fails', async () => {
                const permanentError = makeQueryFailedError("Field 'user_id' doesn't have a default value");
                mockStrategy.dbCreateOrUpdateFunc.mockRejectedValue(permanentError);
                jest.spyOn(discrepancyRepositoryService, 'deleteById').mockRejectedValue(new Error('DB down'));

                jest.spyOn(console, 'warn').mockImplementation(() => undefined);
                jest.spyOn(console, 'error').mockImplementation(() => undefined);

                // Should not throw even if the delete fails
                await expect(
                    handler.execute(
                        new SyncDiscrepancyCommand(
                            TRANSACTION_ID,
                            TENANT_ID,
                            DISCREPANCY_ID,
                            DiscrepancySyncType.ExternalToInternal,
                        ),
                    ),
                ).resolves.toBeUndefined();
            });
        });

        describe('transient failures – should rethrow and NOT auto-delete', () => {
            it('should rethrow a generic runtime error', async () => {
                const transientError = new Error('Network timeout');
                mockStrategy.dbCreateOrUpdateFunc.mockRejectedValue(transientError);

                jest.spyOn(console, 'error').mockImplementation(() => undefined);

                await expect(
                    handler.execute(
                        new SyncDiscrepancyCommand(
                            TRANSACTION_ID,
                            TENANT_ID,
                            DISCREPANCY_ID,
                            DiscrepancySyncType.ExternalToInternal,
                        ),
                    ),
                ).rejects.toThrow('Network timeout');

                // deleteById should NOT be called by the permanent-failure path
                expect(discrepancyRepositoryService.deleteById).not.toHaveBeenCalled();
                expect(eventBus.publish).not.toHaveBeenCalled();
            });

            it('should rethrow a QueryFailedError that is NOT a schema constraint violation', async () => {
                // FK constraint failures may be transient (referenced entity not synced yet)
                const fkError = makeQueryFailedError('a foreign key constraint fails');
                mockStrategy.dbCreateOrUpdateFunc.mockRejectedValue(fkError);

                jest.spyOn(console, 'error').mockImplementation(() => undefined);

                await expect(
                    handler.execute(
                        new SyncDiscrepancyCommand(
                            TRANSACTION_ID,
                            TENANT_ID,
                            DISCREPANCY_ID,
                            DiscrepancySyncType.ExternalToInternal,
                        ),
                    ),
                ).rejects.toThrow(fkError);

                expect(discrepancyRepositoryService.deleteById).not.toHaveBeenCalled();
            });
        });
    });
    describe('retries (real RetryUtility)', () => {
        const command = (syncType: DiscrepancySyncType) =>
            new SyncDiscrepancyCommand(TRANSACTION_ID, TENANT_ID, DISCREPANCY_ID, syncType);
        const driverError = (code: string, message: string) =>
            new QueryFailedError('INSERT INTO ...', [], Object.assign(new Error(message), { code }));

        beforeEach(() => {
            (RetryUtility.executeWithRetry as jest.Mock).mockRestore();
            jest.spyOn(RetryUtility, 'delay').mockResolvedValue(undefined);
            jest.spyOn(console, 'error').mockImplementation(() => undefined);
            jest.spyOn(console, 'warn').mockImplementation(() => undefined);
            jest.spyOn(console, 'log').mockImplementation(() => undefined);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('does not retry a foreign key violation', async () => {
            const fkError = driverError('ER_NO_REFERENCED_ROW_2', 'a foreign key constraint fails');
            mockStrategy.dbCreateOrUpdateFunc.mockRejectedValue(fkError);

            await expect(handler.execute(command(DiscrepancySyncType.ExternalToInternal))).rejects.toThrow(fkError);

            expect(mockStrategy.dbCreateOrUpdateFunc).toHaveBeenCalledTimes(1);
        });

        it('retries a deadlock once', async () => {
            mockStrategy.dbCreateOrUpdateFunc
                .mockRejectedValueOnce(driverError('ER_LOCK_DEADLOCK', 'Deadlock found'))
                .mockResolvedValueOnce(undefined);

            await handler.execute(command(DiscrepancySyncType.ExternalToInternal));

            expect(mockStrategy.dbCreateOrUpdateFunc).toHaveBeenCalledTimes(2);
            expect(eventBus.publish).toHaveBeenCalledTimes(1);
        });

        it('does not repeat a failed BeyondTrust write', async () => {
            (discrepancyRepositoryService.findOneById as jest.Mock).mockResolvedValue({
                ...mockDiscrepancy,
                internalData: { id: 99 },
                externalData: undefined,
            });
            const writeError = new Error('BeyondTrust POST /user failed with status 504 (Transient)');
            mockStrategy.btCreateFunc.mockRejectedValue(writeError);

            await expect(handler.execute(command(DiscrepancySyncType.InternalToExternal))).rejects.toThrow(writeError);

            expect(mockStrategy.btCreateFunc).toHaveBeenCalledTimes(1);
        });
    });
});
