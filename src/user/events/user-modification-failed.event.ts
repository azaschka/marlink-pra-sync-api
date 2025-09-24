import { BaseEvent } from '../../core/events';
import { User } from '../models';

export interface UserModificationFailedEventPayload {
    errorMessage: string;
    user: User;
    tenantId: number;
}

export class UserModificationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-modification-failed';

    constructor(transactionId: string, payload: UserModificationFailedEventPayload) {
        super(UserModificationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
