import { BaseEvent } from '../../../core/events';

export interface RemoteVncDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
    tenantId: number;
}

export class RemoteVncDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-vnc-deletion-failed';

    constructor(transactionId: string, payload: RemoteVncDeletionFailedEventPayload) {
        super(RemoteVncDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
