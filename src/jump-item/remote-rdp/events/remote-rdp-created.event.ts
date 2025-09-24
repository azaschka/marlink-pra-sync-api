import { BaseEvent } from '../../../core/events';
import { RemoteRdp } from '../models';

export interface RemoteRdpCreatedEventPayload {
    remoteRdp: RemoteRdp;
    tenantId: number;
}

export class RemoteRdpCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-rdp-created';

    constructor(transactionId: string, payload: RemoteRdpCreatedEventPayload) {
        super(RemoteRdpCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
