import { BaseEvent } from '../../core/events';

export interface JumpClientsSyncedEventPayload {
    createdJumpClientIds: number[];
    updatedJumpClientIds: number[];
    deletedJumpClientIds: number[];
    tenantId: number;
}

export class JumpClientsSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-clients-synced';

    constructor(transactionId: string, payload: JumpClientsSyncedEventPayload) {
        super(JumpClientsSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
