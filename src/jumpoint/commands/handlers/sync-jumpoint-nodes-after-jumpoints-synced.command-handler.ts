import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { JumpointNodeRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import { RetrieveJumpointNodesQuery as BTRetrieveJumpointNodesQuery } from '../../../beyondtrust-pra-conf-api/jumpoint/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpointNodesSyncedEvent, JumpointNodesSyncFailedEvent } from '../../events';
import { JumpointNode } from '../../models';
import { JumpointNodeEntity } from '../../repositories/entities';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { SyncJumpointNodesAfterJumpointsSyncedCommand } from '../sync-jumpoint-nodes-after-jumpoints-synced.command';

@CommandHandler(SyncJumpointNodesAfterJumpointsSyncedCommand)
export class SyncJumpointNodesAfterJumpointsSyncedCommandHandler
    implements ICommandHandler<SyncJumpointNodesAfterJumpointsSyncedCommand>
{
    constructor(
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly jumpointNodeRepositoryService: JumpointNodeRepositoryService,
    ) {}

    public async execute(command: SyncJumpointNodesAfterJumpointsSyncedCommand): Promise<void> {
        for (const jumpointId of [...command.createdJumpointIds, ...command.updatedJumpointIds]) {
            try {
                const btJumpointNodes = await this.retrieveAllBTJumpointNodes(command.transactionId, jumpointId);
                const jumpointNodeEntities = this.createJumpointNodeEntities(jumpointId, btJumpointNodes);
                const jumpointNodes = await this.replaceJumpointNodes(
                    command.tenantId,
                    jumpointId,
                    jumpointNodeEntities,
                );

                if (jumpointNodes.length === 0) {
                    continue;
                }

                this.eventBus.publish(
                    new JumpointNodesSyncedEvent(command.transactionId, {
                        jumpointNodes: jumpointNodes,
                    }),
                );
            } catch (error) {
                this.eventBus.publish(
                    new JumpointNodesSyncFailedEvent(command.transactionId, {
                        errorMessage: `Failed to sync for jumpoint "${jumpointId}": ${ErrorProcessorUtility.stringify(error)}`,
                    }),
                );
            }
        }

        try {
            await this.jumpointNodeRepositoryService.deleteByJumpointIds(command.tenantId, command.deletedJumpointIds);
        } catch (error) {
            this.eventBus.publish(
                new JumpointNodesSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                }),
            );
        }
    }

    private async retrieveAllBTJumpointNodes(transactionId: string, jumpointId: number) {
        return await this.queryBus.execute<BTRetrieveJumpointNodesQuery, JumpointNodeRetrievedDtoOutput[]>(
            new BTRetrieveJumpointNodesQuery(transactionId, jumpointId),
        );
    }

    private createJumpointNodeEntities(jumpointId: number, btJumpointNodes: JumpointNodeRetrievedDtoOutput[]) {
        return btJumpointNodes.map((jumpointNode) =>
            JumpointNodeEntity.create(
                jumpointNode.id,
                jumpointId,
                jumpointNode.lastConnectTimestamp,
                jumpointNode.lastDisconnectTimestamp,
                jumpointNode.publicIp,
                jumpointNode.privateIp,
                jumpointNode.hostname,
            ),
        );
    }

    private async replaceJumpointNodes(
        tenantId: number,
        jumpointId: number,
        jumpointNodeEntities: JumpointNodeEntity[],
    ): Promise<JumpointNode[]> {
        // Delete all existing jumpoint nodes
        await this.jumpointNodeRepositoryService.deleteByJumpointId(tenantId, jumpointId);

        // Recreate the jumpoint nodes
        await this.jumpointNodeRepositoryService.createOrUpdateByIdAndJumpointId(tenantId, jumpointNodeEntities);

        return jumpointNodeEntities.map((entity) => {
            return {
                id: entity.id,
                jumpointId: entity.jumpointId,
                lastConnectDate: entity.lastConnectDate,
                lastDisconnectDate: entity.lastDisconnectDate,
                publicIp: entity.publicIp,
                privateIp: entity.privateIp,
                hostname: entity.hostname,
                lastSyncDate: entity.lastSyncDate,
            };
        });
    }
}
