import { BaseEvent } from '../../core/events';

export interface UsersSyncFailedEventPayload {
    errorMessage: string;
    tenantId: number;
}

export class UsersSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'users-sync-failed';

    constructor(transactionId: string, payload: UsersSyncFailedEventPayload) {
        super(UsersSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
