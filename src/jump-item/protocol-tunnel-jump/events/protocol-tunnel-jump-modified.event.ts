import { BaseEvent } from '../../../core/events';
import { ProtocolTunnelJump } from '../models';

export interface ProtocolTunnelJumpModifiedEventPayload {
    protocolTunnelJump: ProtocolTunnelJump;
    tenantId: number;
}

export class ProtocolTunnelJumpModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'protocol-tunnel-jump-modified';

    constructor(transactionId: string, payload: ProtocolTunnelJumpModifiedEventPayload) {
        super(ProtocolTunnelJumpModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
