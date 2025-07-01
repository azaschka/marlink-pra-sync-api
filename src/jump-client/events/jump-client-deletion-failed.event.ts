import { BaseEvent } from '../../core/events';

export interface JumpClientDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
}

export class JumpClientDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-client-deletion-failed';

    constructor(transactionId: string, payload: JumpClientDeletionFailedEventPayload) {
        super(JumpClientDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
