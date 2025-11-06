import { BaseEvent } from '../../core/events';

export interface GroupPoliciesSyncFailedEventPayload {
    errorMessage: string;
    tenantId: number;
}

export class GroupPoliciesSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policies-sync-failed';

    constructor(transactionId: string, payload: GroupPoliciesSyncFailedEventPayload) {
        super(GroupPoliciesSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
