import { BaseEvent } from '../../../core/events';
import { ProtocolTunnelJump } from '../models';

export interface ProtocolTunnelJumpCopyFailedEventPayload {
    errorMessage: string;
    protocolTunnelJump: ProtocolTunnelJump;
    tenantId: number;
}

export class ProtocolTunnelJumpCopyFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'protocol-tunnel-jump-copy-failed';

    constructor(transactionId: string, payload: ProtocolTunnelJumpCopyFailedEventPayload) {
        super(ProtocolTunnelJumpCopyFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
