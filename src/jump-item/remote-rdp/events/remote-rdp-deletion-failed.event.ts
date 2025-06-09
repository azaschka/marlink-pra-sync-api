import { BaseEvent } from '../../../core/events';

export interface RemoteRdpDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
}

export class RemoteRdpDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-rdp-deletion-failed';

    constructor(transactionId: string, payload: RemoteRdpDeletionFailedEventPayload) {
        super(RemoteRdpDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
