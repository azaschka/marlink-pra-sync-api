import { BaseEvent } from '../../core/events';
import { User } from '../models';

export interface UserUpdatedEventPayload {
    user: User;
}

export class UserUpdatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-updated';

    constructor(transactionId: string, payload: UserUpdatedEventPayload) {
        super(UserUpdatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
