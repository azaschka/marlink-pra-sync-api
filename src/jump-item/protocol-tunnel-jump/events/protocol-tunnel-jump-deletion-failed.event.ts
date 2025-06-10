import { BaseEvent } from '../../../core/events';

export interface ProtocolTunnelJumpDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
}

export class ProtocolTunnelJumpDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'protocol-tunnel-jump-deletion-failed';

    constructor(transactionId: string, payload: ProtocolTunnelJumpDeletionFailedEventPayload) {
        super(ProtocolTunnelJumpDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
