import { BaseEvent } from '../../../core/events';

export interface RemoteRdpsSyncFailedEventPayload {
    errorMessage: string;
    tenantId: number;
}

export class RemoteRdpsSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-rdps-sync-failed';

    constructor(transactionId: string, payload: RemoteRdpsSyncFailedEventPayload) {
        super(RemoteRdpsSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
