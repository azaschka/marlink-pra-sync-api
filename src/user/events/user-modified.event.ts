import { BaseEvent } from '../../core/events';
import { User } from '../models';

export interface UserModifiedEventPayload {
    user: User;
    tenantId: number;
}

export class UserModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-modified';

    constructor(transactionId: string, payload: UserModifiedEventPayload) {
        super(UserModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
