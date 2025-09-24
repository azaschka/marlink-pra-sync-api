import { BaseEvent } from '../../../core/events';
import { RemoteRdp } from '../models';

export interface RemoteRdpCopiedEventPayload {
    remoteRdp: RemoteRdp;
    tenantId: number;
}

export class RemoteRdpCopiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-rdp-copied';

    constructor(transactionId: string, payload: RemoteRdpCopiedEventPayload) {
        super(RemoteRdpCopiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
