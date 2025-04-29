import { BaseEvent } from '../../core/events';

export interface UserCreatedEventPayload {
    publicDisplayName: string;
    id?: number;
    username?: string;
    email?: string;
    creationDate?: Date;
}

export class UserCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-created';

    constructor(transactionId: string, payload: UserCreatedEventPayload) {
        super(UserCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
