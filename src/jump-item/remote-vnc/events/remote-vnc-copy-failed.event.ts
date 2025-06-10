import { BaseEvent } from '../../../core/events';
import { RemoteVnc } from '../models';

export interface RemoteVncCopyFailedEventPayload {
    errorMessage: string;
    remoteVnc: RemoteVnc;
}

export class RemoteVncCopyFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-vnc-copy-failed';

    constructor(transactionId: string, payload: RemoteVncCopyFailedEventPayload) {
        super(RemoteVncCopyFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
