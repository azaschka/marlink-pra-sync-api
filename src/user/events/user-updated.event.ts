import { BaseEvent } from '../../core/events';
import { UserUpdated } from '../models';

export type UserUpdatedEventPayload = Partial<UserUpdated>;

export class UserUpdatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-updated';

    constructor(transactionId: string, payload: UserUpdatedEventPayload) {
        super(UserUpdatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
