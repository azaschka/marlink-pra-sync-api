import { BaseEvent } from '../../../core/events';
import { ProtocolTunnelJump } from '../models';

export interface ProtocolTunnelJumpCopiedEventPayload {
    protocolTunnelJump: ProtocolTunnelJump;
}

export class ProtocolTunnelJumpCopiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'protocol-tunnel-jump-copied';

    constructor(transactionId: string, payload: ProtocolTunnelJumpCopiedEventPayload) {
        super(ProtocolTunnelJumpCopiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
