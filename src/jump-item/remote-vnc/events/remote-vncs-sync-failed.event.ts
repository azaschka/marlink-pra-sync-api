import { BaseEvent } from '../../../core/events';

export interface RemoteVncsSyncFailedEventPayload {
    errorMessage: string;
    tenantId: number;
}

export class RemoteVncsSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-vncs-sync-failed';

    constructor(transactionId: string, payload: RemoteVncsSyncFailedEventPayload) {
        super(RemoteVncsSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
