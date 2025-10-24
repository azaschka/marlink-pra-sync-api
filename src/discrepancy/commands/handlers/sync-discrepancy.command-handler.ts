import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { GroupPolicyRetrievedDtoOutput as BTGroupPolicy } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { GroupPolicy as DBGroupPolicy } from '../../../group-policy/models';
import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { DiscrepancySyncType } from '../../enums';
import { DiscrepancyResolvedEvent } from '../../events';
import { Discrepancy } from '../../models';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { DiscrepancyStrategyProviderService } from '../../services/discrepancy-strategy-provider.service';
import { DiscrepancyStrategy } from '../../types';
import { SyncDiscrepancyCommand } from '../sync-discrepancy.command';

// Using GroupPolicy as representative type.
// TODO: Generalize for different discrepancy types.
type RepresentativeEntity = GroupPolicyEntity;
type BTRepresentative = BTGroupPolicy;
type DBRepresentative = DBGroupPolicy;

@CommandHandler(SyncDiscrepancyCommand)
export class SyncDiscrepancyCommandHandler implements ICommandHandler<SyncDiscrepancyCommand> {
    constructor(
        private readonly discrepancyStrategyProviderService: DiscrepancyStrategyProviderService,
        private readonly discrepancyRepositoryService: DiscrepancyRepositoryService,
        private readonly eventBus: EventBus,
    ) {}

    public async execute(command: SyncDiscrepancyCommand): Promise<void> {
        const discrepancy = await this.getDiscrepancy(command.tenantId, command.id);
        const discrepancyStrategy = this.discrepancyStrategyProviderService.get(
            discrepancy.entityType,
        ) as DiscrepancyStrategy<BTRepresentative, DBRepresentative, RepresentativeEntity>;

        if (command.syncType === DiscrepancySyncType.ExternalToInternal) {
            if (discrepancy.externalData) {
                // Either create or modify internal data
                await discrepancyStrategy.dbCreateOrUpdateFunc(
                    command.tenantId,
                    discrepancy.externalData as unknown as RepresentativeEntity,
                );
            } else {
                // Delete internal data
                await discrepancyStrategy.dbDeleteFunc(
                    command.tenantId,
                    discrepancy.internalData as unknown as RepresentativeEntity,
                );
            }
        } else {
            if (discrepancy.internalData) {
                if (discrepancy.externalData) {
                    // Modify external data
                    await discrepancyStrategy.btModifyFunc(
                        command.transactionId,
                        command.tenantId,
                        discrepancy.internalData as unknown as RepresentativeEntity,
                    );
                } else {
                    // Create external data
                    await discrepancyStrategy.btCreateFunc(
                        command.transactionId,
                        command.tenantId,
                        discrepancy.internalData as unknown as RepresentativeEntity,
                    );
                }
            } else {
                // Delete external data
                await discrepancyStrategy.btDeleteFunc(
                    command.transactionId,
                    command.tenantId,
                    discrepancy.externalData as unknown as RepresentativeEntity,
                );
            }
        }

        await this.discrepancyRepositoryService.deleteById(command.tenantId, command.id);

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
}
