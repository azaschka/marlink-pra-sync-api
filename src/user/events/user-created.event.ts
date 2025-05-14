import { BaseEvent } from '../../core/events';
import { User } from '../models';

export interface UserCreatedEventPayload {
    user: User;
}

export class UserCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-created';

    constructor(transactionId: string, payload: UserCreatedEventPayload) {
        super(UserCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
