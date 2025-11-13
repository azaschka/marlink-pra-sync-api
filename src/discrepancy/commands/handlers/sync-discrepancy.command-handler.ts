/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RetryUtility } from '../../../shared/utilities';
import { DiscrepancyEntityType, DiscrepancySyncType } from '../../enums';
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
        console.log(
            `🔄 Starting discrepancy sync for ${command.id} (type: ${command.syncType}, entity: ${await this.getDiscrepancy(command.tenantId, command.id).then((d) => d.entityType)})...`,
        );

        const discrepancy = await this.getDiscrepancy(command.tenantId, command.id);
        const discrepancyStrategy = this.getDiscrepancyStrategy(discrepancy);

        try {
            if (command.syncType === DiscrepancySyncType.ExternalToInternal) {
                if (discrepancy.externalData) {
                    // Either create or modify internal data
                    console.log(`📥 Syncing from BeyondTrust to database (create/update)...`);
                    await RetryUtility.executeWithRetry(
                        () =>
                            discrepancyStrategy.dbCreateOrUpdateFunc(
                                command.tenantId,
                                discrepancy.externalData as unknown as any,
                            ),
                        `Create/Update internal data for discrepancy ${command.id}`,
                    );
                } else {
                    // Delete internal data
                    console.log(`🗑️ Deleting from database...`);
                    await RetryUtility.executeWithRetry(
                        () =>
                            discrepancyStrategy.dbDeleteFunc(
                                command.tenantId,
                                discrepancy.internalData as unknown as any,
                            ),
                        `Delete internal data for discrepancy ${command.id}`,
                    );
                }
            } else {
                if (discrepancy.internalData) {
                    if (discrepancy.externalData) {
                        // Modify external data
                        console.log(`📤 Syncing from database to BeyondTrust (modify)...`);
                        await RetryUtility.executeWithRetry(
                            () =>
                                discrepancyStrategy.btModifyFunc(
                                    command.transactionId,
                                    command.tenantId,
                                    discrepancy.internalData as unknown as any,
                                ),
                            `Modify external data for discrepancy ${command.id}`,
                        );
                    } else {
                        // Create external data
                        console.log(`📤 Syncing from database to BeyondTrust (create)...`);
                        await RetryUtility.executeWithRetry(
                            () =>
                                discrepancyStrategy.btCreateFunc(
                                    command.transactionId,
                                    command.tenantId,
                                    discrepancy.internalData as unknown as any,
                                ),
                            `Create external data for discrepancy ${command.id}`,
                        );
                    }
                } else {
                    // Delete external data
                    console.log(`🗑️ Deleting from BeyondTrust...`);
                    await RetryUtility.executeWithRetry(
                        () =>
                            discrepancyStrategy.btDeleteFunc(
                                command.transactionId,
                                command.tenantId,
                                discrepancy.externalData as unknown as any,
                            ),
                        `Delete external data for discrepancy ${command.id}`,
                    );
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Error syncing discrepancy ${command.id}:`, errorMessage);
            throw error;
        }

        console.log(`🗑️ Deleting discrepancy record ${command.id}...`);
        await RetryUtility.executeWithRetry(
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

        console.log(
            `✅ Successfully synced and resolved discrepancy ${command.id} (${discrepancy.entityType}, sync type: ${command.syncType})`,
        );
    }

    private async getDiscrepancy(tenantId: number, id: number): Promise<Discrepancy> {
        const discrepancy = await this.discrepancyRepositoryService.findOneById(tenantId, id);

        if (!discrepancy) {
            throw new NotFoundException(`Discrepancy with ID ${id} not found for tenant ${tenantId}`);
        }

        return discrepancy;
    }

    private getDiscrepancyStrategy(discrepancy: Discrepancy) {
        if (
            [
                DiscrepancyEntityType.GroupPolicyJumpGroup,
                DiscrepancyEntityType.GroupPolicyJumpoint,
                DiscrepancyEntityType.GroupPolicyTeam,
                DiscrepancyEntityType.GroupPolicyMember,
                DiscrepancyEntityType.JumpointNode,
                DiscrepancyEntityType.TeamUser,
                DiscrepancyEntityType.UserGroupPolicy,
            ].includes(discrepancy.entityType)
        ) {
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
