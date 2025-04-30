import { BaseEvent } from '../../core/events';
import { UserCreated } from '../models';

export type UserCreatedEventPayload = UserCreated;

export class UserCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-created';

    constructor(transactionId: string, payload: UserCreatedEventPayload) {
        super(UserCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
