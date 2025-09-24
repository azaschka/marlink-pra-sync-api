import { BaseEvent } from '../../core/events';

export interface UserDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
    tenantId: number;
}

export class UserDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-deletion-failed';

    constructor(transactionId: string, payload: UserDeletionFailedEventPayload) {
        super(UserDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
