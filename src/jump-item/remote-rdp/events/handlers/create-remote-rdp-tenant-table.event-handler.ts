import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BeyondtrustInstanceCreatedEvent } from '../../../../beyondtrust-instance/events';
import { TenantTableCreatedEvent, TenantTableCreationFailedEvent } from '../../../../shared/events';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';

@EventsHandler(BeyondtrustInstanceCreatedEvent)
export class CreateRemoteRdpTenantTableEventHandler implements IEventHandler<BeyondtrustInstanceCreatedEvent> {
    constructor(
        private readonly remoteRdpRepositoryService: RemoteRdpRepositoryService,
        private readonly eventBus: EventBus,
    ) {}

    public async handle(event: BeyondtrustInstanceCreatedEvent) {
        try {
            const { tableName } = await this.remoteRdpRepositoryService.createAndConnectTable(
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
