import { BaseEvent } from '../../../core/events';

export interface ProtocolTunnelJumpsSyncFailedEventPayload {
    errorMessage: string;
}

export class ProtocolTunnelJumpsSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'protocol-tunnel-jumps-sync-failed';

    constructor(transactionId: string, payload: ProtocolTunnelJumpsSyncFailedEventPayload) {
        super(ProtocolTunnelJumpsSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
