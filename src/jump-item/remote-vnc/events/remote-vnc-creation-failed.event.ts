import { BaseEvent } from '../../../core/events';
import { RemoteVnc } from '../models';

export interface RemoteVncCreationFailedEventPayload {
    errorMessage: string;
    remoteVnc: RemoteVnc;
    tenantId: number;
}

export class RemoteVncCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-vnc-creation-failed';

    constructor(transactionId: string, payload: RemoteVncCreationFailedEventPayload) {
        super(RemoteVncCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
