import { BaseEvent } from '../../../core/events';
import { ProtocolTunnelJump } from '../models';

export interface ProtocolTunnelJumpModificationFailedEventPayload {
    errorMessage: string;
    protocolTunnelJump: ProtocolTunnelJump;
    tenantId: number;
}

export class ProtocolTunnelJumpModificationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'protocol-tunnel-jump-modification-failed';

    constructor(transactionId: string, payload: ProtocolTunnelJumpModificationFailedEventPayload) {
        super(ProtocolTunnelJumpModificationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
