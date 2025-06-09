import { BaseEvent } from '../../../core/events';
import { RemoteRdp } from '../models';

export interface RemoteRdpModifiedEventPayload {
    remoteRdp: RemoteRdp;
}

export class RemoteRdpModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-rdp-modified';

    constructor(transactionId: string, payload: RemoteRdpModifiedEventPayload) {
        super(RemoteRdpModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
