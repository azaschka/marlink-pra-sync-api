import { BaseEvent } from '../../../core/events';

export interface RemoteRdpDeletedEventPayload {
    id: number;
    tenantId: number;
}

export class RemoteRdpDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-rdp-deleted';

    constructor(transactionId: string, payload: RemoteRdpDeletedEventPayload) {
        super(RemoteRdpDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
