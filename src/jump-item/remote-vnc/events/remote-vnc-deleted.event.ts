import { BaseEvent } from '../../../core/events';

export interface RemoteVncDeletedEventPayload {
    id: number;
}

export class RemoteVncDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-vnc-deleted';

    constructor(transactionId: string, payload: RemoteVncDeletedEventPayload) {
        super(RemoteVncDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
