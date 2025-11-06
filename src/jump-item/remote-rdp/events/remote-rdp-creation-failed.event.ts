import { BaseEvent } from '../../../core/events';
import { RemoteRdp } from '../models';

export interface RemoteRdpCreationFailedEventPayload {
    errorMessage: string;
    remoteRdp: RemoteRdp;
    tenantId: number;
}

export class RemoteRdpCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-rdp-creation-failed';

    constructor(transactionId: string, payload: RemoteRdpCreationFailedEventPayload) {
        super(RemoteRdpCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
