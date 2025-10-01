import { BaseEvent } from '../../core/events';
import { User } from '../models';

export interface UserCreationFailedEventPayload {
    errorMessage: string;
    user: User;
    tenantId: number;
}

export class UserCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-creation-failed';

    constructor(transactionId: string, payload: UserCreationFailedEventPayload) {
        super(UserCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
