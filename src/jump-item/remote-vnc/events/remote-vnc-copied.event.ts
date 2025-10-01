import { BaseEvent } from '../../../core/events';
import { RemoteVnc } from '../models';

export interface RemoteVncCopiedEventPayload {
    remoteVnc: RemoteVnc;
    tenantId: number;
}

export class RemoteVncCopiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-vnc-copied';

    constructor(transactionId: string, payload: RemoteVncCopiedEventPayload) {
        super(RemoteVncCopiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
