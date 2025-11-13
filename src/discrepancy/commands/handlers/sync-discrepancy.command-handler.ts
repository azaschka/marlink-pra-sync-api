/* eslint-disable @typescript-eslint/no-explicit-any */

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
        const discrepancy = await this.getDiscrepancy(command.tenantId, command.id);
        const discrepancyStrategy = this.getDiscrepancyStrategy(discrepancy);

        try {
            if (command.syncType === DiscrepancySyncType.ExternalToInternal) {
                if (discrepancy.externalData) {
                    await RetryUtility.executeWithRetry(
                        () =>
                            discrepancyStrategy.dbCreateOrUpdateFunc(
                                command.tenantId,
                                discrepancy.externalData as unknown as any,
                            ),
                        `Create/Update internal data for discrepancy ${command.id}`,
                    );
                } else {
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
