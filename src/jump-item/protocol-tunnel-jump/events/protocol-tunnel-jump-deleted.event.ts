import { BaseEvent } from '../../../core/events';

export interface ProtocolTunnelJumpDeletedEventPayload {
    id: number;
}

export class ProtocolTunnelJumpDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'protocol-tunnel-jump-deleted';

    constructor(transactionId: string, payload: ProtocolTunnelJumpDeletedEventPayload) {
        super(ProtocolTunnelJumpDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
