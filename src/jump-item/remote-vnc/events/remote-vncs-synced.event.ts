import { BaseEvent } from '../../../core/events';

export interface RemoteVncsSyncedEventPayload {
    createdRemoteVncIds: number[];
    updatedRemoteVncIds: number[];
    deletedRemoteVncIds: number[];
    tenantId: number;
}

export class RemoteVncsSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-vncs-synced';

    constructor(transactionId: string, payload: RemoteVncsSyncedEventPayload) {
        super(RemoteVncsSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
