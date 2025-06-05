import { BaseEvent } from '../../core/events';

export interface UserGroupPoliciesSyncFailedEventPayload {
    errorMessage: string;
}

export class UserGroupPoliciesSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-group-policies-sync-failed';

    constructor(transactionId: string, payload: UserGroupPoliciesSyncFailedEventPayload) {
        super(UserGroupPoliciesSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
