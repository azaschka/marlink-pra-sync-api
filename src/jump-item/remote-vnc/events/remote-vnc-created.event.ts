import { BaseEvent } from '../../../core/events';
import { RemoteVnc } from '../models';

export interface RemoteVncCreatedEventPayload {
    remoteVnc: RemoteVnc;
}

export class RemoteVncCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-vnc-created';

    constructor(transactionId: string, payload: RemoteVncCreatedEventPayload) {
        super(RemoteVncCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
