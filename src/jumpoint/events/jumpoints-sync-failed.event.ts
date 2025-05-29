import { BaseEvent } from '../../core/events';

export interface JumpointsSyncFailedEventPayload {
    errorMessage: string;
}

export class JumpointsSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoints-sync-failed';

    constructor(transactionId: string, payload: JumpointsSyncFailedEventPayload) {
        super(JumpointsSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
