import { BaseEvent } from '../../../core/events';
import { RemoteRdp } from '../models';

export interface RemoteRdpModificationFailedEventPayload {
    errorMessage: string;
    remoteRdp: RemoteRdp;
}

export class RemoteRdpModificationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-rdp-modification-failed';

    constructor(transactionId: string, payload: RemoteRdpModificationFailedEventPayload) {
        super(RemoteRdpModificationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
