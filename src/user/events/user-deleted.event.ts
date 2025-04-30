import { BaseEvent } from '../../core/events';

export interface UserDeletedEventPayload {
    id: number;
}

export class UserDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-deleted';

    constructor(transactionId: string, payload: UserDeletedEventPayload) {
        super(UserDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
