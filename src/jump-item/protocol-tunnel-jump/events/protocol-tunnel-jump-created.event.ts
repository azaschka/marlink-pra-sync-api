import { BaseEvent } from '../../../core/events';
import { ProtocolTunnelJump } from '../models';

export interface ProtocolTunnelJumpCreatedEventPayload {
    protocolTunnelJump: ProtocolTunnelJump;
    tenantId: number;
}

export class ProtocolTunnelJumpCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'protocol-tunnel-jump-created';

    constructor(transactionId: string, payload: ProtocolTunnelJumpCreatedEventPayload) {
        super(ProtocolTunnelJumpCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
