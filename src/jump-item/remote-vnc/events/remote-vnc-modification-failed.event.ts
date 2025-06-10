import { BaseEvent } from '../../../core/events';
import { RemoteVnc } from '../models';

export interface RemoteVncModificationFailedEventPayload {
    errorMessage: string;
    remoteVnc: RemoteVnc;
}

export class RemoteVncModificationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-vnc-modification-failed';

    constructor(transactionId: string, payload: RemoteVncModificationFailedEventPayload) {
        super(RemoteVncModificationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
