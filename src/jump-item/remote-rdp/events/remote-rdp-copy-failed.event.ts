import { BaseEvent } from '../../../core/events';
import { RemoteRdp } from '../models';

export interface RemoteRdpCopyFailedEventPayload {
    errorMessage: string;
    remoteRdp: RemoteRdp;
    tenantId: number;
}

export class RemoteRdpCopyFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-rdp-copy-failed';

    constructor(transactionId: string, payload: RemoteRdpCopyFailedEventPayload) {
        super(RemoteRdpCopyFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
