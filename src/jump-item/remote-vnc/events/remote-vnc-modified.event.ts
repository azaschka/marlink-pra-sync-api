import { BaseEvent } from '../../../core/events';
import { RemoteVnc } from '../models';

export interface RemoteVncModifiedEventPayload {
    remoteVnc: RemoteVnc;
    tenantId: number;
}

export class RemoteVncModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-vnc-modified';

    constructor(transactionId: string, payload: RemoteVncModifiedEventPayload) {
        super(RemoteVncModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
