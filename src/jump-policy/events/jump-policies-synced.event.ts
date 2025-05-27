import { BaseEvent } from '../../core/events';

export interface JumpPoliciesSyncedEventPayload {
    createdJumpPolicyIds: number[];
    updatedJumpPolicyIds: number[];
    deletedJumpPolicyIds: number[];
}

export class JumpPoliciesSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-policies-synced';

    constructor(transactionId: string, payload: JumpPoliciesSyncedEventPayload) {
        super(JumpPoliciesSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
