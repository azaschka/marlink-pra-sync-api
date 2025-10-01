import { BaseEvent } from '../../core/events';

export interface JumpointsSyncedEventPayload {
    createdJumpointIds: number[];
    updatedJumpointIds: number[];
    deletedJumpointIds: number[];
    tenantId: number;
}

export class JumpointsSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoints-synced';

    constructor(transactionId: string, payload: JumpointsSyncedEventPayload) {
        super(JumpointsSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
