import { BaseEvent } from '../../core/events';

export interface SessionPoliciesSyncedEventPayload {
    createdSessionPolicyIds: number[];
    updatedSessionPolicyIds: number[];
    deletedSessionPolicyIds: number[];
    tenantId: number;
}

export class SessionPoliciesSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'session-policies-synced';

    constructor(transactionId: string, payload: SessionPoliciesSyncedEventPayload) {
        super(SessionPoliciesSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
