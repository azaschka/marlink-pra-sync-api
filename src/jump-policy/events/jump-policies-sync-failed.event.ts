import { BaseEvent } from '../../core/events';

export interface JumpPoliciesSyncFailedEventPayload {
    errorMessage: string;
}

export class JumpPoliciesSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-policies-sync-failed';

    constructor(transactionId: string, payload: JumpPoliciesSyncFailedEventPayload) {
        super(JumpPoliciesSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
