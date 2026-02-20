import { BaseEvent } from '../../core/events';

export interface SessionPoliciesSyncFailedEventPayload {
    errorMessage: string;
    tenantId: number;
}

export class SessionPoliciesSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'session-policies-sync-failed';

    constructor(transactionId: string, payload: SessionPoliciesSyncFailedEventPayload) {
        super(SessionPoliciesSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
