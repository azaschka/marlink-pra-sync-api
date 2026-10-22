/* eslint-disable @typescript-eslint/no-explicit-any */

import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { QueryFailedError } from 'typeorm';
import { RetryUtility } from '../../../shared/utilities';
import { DiscrepancySyncType, isRelationDiscrepancyEntityType } from '../../enums';
import { DiscrepancyResolvedEvent } from '../../events';
import { Discrepancy } from '../../models';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { DiscrepancyStrategyProviderService } from '../../services/discrepancy-strategy-provider.service';
import { DiscrepancyStrategy } from '../../types';
import { SyncDiscrepancyCommand } from '../sync-discrepancy.command';

@CommandHandler(SyncDiscrepancyCommand)
export class SyncDiscrepancyCommandHandler implements ICommandHandler<SyncDiscrepancyCommand> {
    constructor(
        private readonly discrepancyStrategyProviderService: DiscrepancyStrategyProviderService,
        private readonly discrepancyRepositoryService: DiscrepancyRepositoryService,
        private readonly eventBus: EventBus,
    ) {}

    public async execute(command: SyncDiscrepancyCommand): Promise<void> {
        const discrepancy = await this.getDiscrepancy(command.tenantId, command.id);
        const discrepancyStrategy = this.getDiscrepancyStrategy(discrepancy);

        try {
            if (command.syncType === DiscrepancySyncType.ExternalToInternal) {
                if (discrepancy.externalData) {
                    await RetryUtility.executeDatabaseOperation(
                        () =>
                            discrepancyStrategy.dbCreateOrUpdateFunc(
                                command.tenantId,
                                discrepancy.externalData as unknown as any,
                            ),
                        `Create/Update internal data for discrepancy ${command.id}`,
                    );
                } else {
                    await RetryUtility.executeDatabaseOperation(
                        () =>
                            discrepancyStrategy.dbDeleteFunc(
                                command.tenantId,
                                discrepancy.internalData as unknown as any,
                            ),
                        `Delete internal data for discrepancy ${command.id}`,
                    );
                }
            } else {
                // BeyondTrust writes are not repeated here: HttpClientService retries only requests that
                // BeyondTrust provably did not process, anything else would risk duplicates.
                if (discrepancy.internalData) {
                    if (discrepancy.externalData) {
                        await discrepancyStrategy.btModifyFunc(
                            command.transactionId,
                            command.tenantId,
                            discrepancy.internalData as unknown as any,
                        );
                    } else {
                        await discrepancyStrategy.btCreateFunc(
                            command.transactionId,
                            command.tenantId,
                            discrepancy.internalData as unknown as any,
                        );
                    }
                } else {
                    await discrepancyStrategy.btDeleteFunc(
                        command.transactionId,
                        command.tenantId,
                        discrepancy.externalData as unknown as any,
                    );
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Error syncing discrepancy ${command.id}:`, errorMessage);

            // Permanent DB schema constraint violations will never resolve via retry.
            // Auto-delete the discrepancy so it does not accumulate as a stale record.
            // The next scheduled scan will re-create it if the underlying problem still exists.
            if (SyncDiscrepancyCommandHandler.isPermanentDbFailure(error)) {
                console.warn(
                    `⚠️ Discrepancy ${command.id} (${discrepancy.entityType}) has a permanent schema constraint failure and cannot be resolved. Auto-deleting to prevent perpetual retries. It will be re-created on the next scan if still applicable.`,
                );
                try {
                    await this.discrepancyRepositoryService.deleteById(command.tenantId, command.id);
                } catch {
                    // Ignore – the record may already be gone or the DB is temporarily unavailable.
                }
                return;
            }

            throw error;
        }

        await RetryUtility.executeDatabaseOperation(
            () => this.discrepancyRepositoryService.deleteById(command.tenantId, command.id),
            `Delete discrepancy record ${command.id}`,
        );

        this.eventBus.publish(
            new DiscrepancyResolvedEvent(command.transactionId, {
                discrepancy: discrepancy,
                syncType: command.syncType,
                tenantId: command.tenantId,
            }),
        );
    }

    /**
     * Returns true for DB errors that are structural/schema violations and will NEVER
     * resolve through retries – i.e. the BeyondTrust payload is missing a value that
     * the local schema requires as NOT NULL with no default (e.g. a GroupPolicyMember
     * of type LDAP-group that has no user_id).
     */
    private static isPermanentDbFailure(error: unknown): boolean {
        if (!(error instanceof QueryFailedError)) return false;
        const msg = error.message.toLowerCase();
        return msg.includes("doesn't have a default value") || msg.includes('cannot be null');
    }

    private async getDiscrepancy(tenantId: number, id: number): Promise<Discrepancy> {
        const discrepancy = await this.discrepancyRepositoryService.findOneById(tenantId, id);

        if (!discrepancy) {
            throw new NotFoundException(`Discrepancy with ID ${id} not found for tenant ${tenantId}`);
        }

        return discrepancy;
    }

    private getDiscrepancyStrategy(discrepancy: Discrepancy) {
        if (isRelationDiscrepancyEntityType(discrepancy.entityType)) {
            return this.discrepancyStrategyProviderService.getForRelation(
                discrepancy.entityId,
                discrepancy.entityType,
            ) as DiscrepancyStrategy<unknown, unknown, unknown>;
        }

        return this.discrepancyStrategyProviderService.get(discrepancy.entityType) as DiscrepancyStrategy<
            unknown,
            unknown,
            unknown
        >;
    }
}
