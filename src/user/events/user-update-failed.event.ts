import { BaseEvent } from '../../core/events';
import { User } from '../models';

export interface UserUpdateFailedEventPayload {
    errorMessage: string;
    user: User;
}

export class UserUpdateFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-update-failed';

    constructor(transactionId: string, payload: UserUpdateFailedEventPayload) {
        super(UserUpdateFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
