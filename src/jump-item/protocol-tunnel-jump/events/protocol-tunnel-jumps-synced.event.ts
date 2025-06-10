import { BaseEvent } from '../../../core/events';

export interface ProtocolTunnelJumpsSyncedEventPayload {
    createdProtocolTunnelJumpIds: number[];
    updatedProtocolTunnelJumpIds: number[];
    deletedProtocolTunnelJumpIds: number[];
}

export class ProtocolTunnelJumpsSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'protocol-tunnel-jumps-synced';

    constructor(transactionId: string, payload: ProtocolTunnelJumpsSyncedEventPayload) {
        super(ProtocolTunnelJumpsSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
