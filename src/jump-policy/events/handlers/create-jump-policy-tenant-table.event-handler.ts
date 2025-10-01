import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BeyondtrustInstanceCreatedEvent } from '../../../beyondtrust-instance/events';
import { TenantTableCreatedEvent, TenantTableCreationFailedEvent } from '../../../shared/events';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';

@EventsHandler(BeyondtrustInstanceCreatedEvent)
export class CreateJumpPolicyTenantTableEventHandler implements IEventHandler<BeyondtrustInstanceCreatedEvent> {
    constructor(
        private readonly jumpPolicyRepositoryService: JumpPolicyRepositoryService,
        private readonly eventBus: EventBus,
    ) {}

    public async handle(event: BeyondtrustInstanceCreatedEvent) {
        try {
            const { tableName } = await this.jumpPolicyRepositoryService.createAndConnectTable(
                event.payload.beyondtrustInstance.id,
            );

            this.eventBus.publish(
                new TenantTableCreatedEvent(event.transactionId, {
                    tenantId: event.payload.beyondtrustInstance.id,
                    tableName: tableName,
                }),
            );
        } catch (error) {
            this.eventBus.publish(
                new TenantTableCreationFailedEvent(event.transactionId, {
                    tenantId: event.payload.beyondtrustInstance.id,
                    errorMessage: ErrorProcessorUtility.stringify(error),
                }),
            );
        }
    }
}
