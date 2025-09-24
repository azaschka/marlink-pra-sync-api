import { BaseEvent } from '../../../core/events';
import { ProtocolTunnelJump } from '../models';

export interface ProtocolTunnelJumpCreationFailedEventPayload {
    errorMessage: string;
    protocolTunnelJump: ProtocolTunnelJump;
    tenantId: number;
}

export class ProtocolTunnelJumpCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'protocol-tunnel-jump-creation-failed';

    constructor(transactionId: string, payload: ProtocolTunnelJumpCreationFailedEventPayload) {
        super(ProtocolTunnelJumpCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
