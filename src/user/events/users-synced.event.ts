import { BaseEvent } from '../../core/events';

export interface UsersSyncedEventPayload {
    createdUserIds: number[];
    updatedUserIds: number[];
    deletedUserIds: number[];
}

export class UsersSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'users-synced';

    constructor(transactionId: string, payload: UsersSyncedEventPayload) {
        super(UsersSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
