import { BaseEvent } from '../../core/events';

export interface JumpointNodesSyncFailedEventPayload {
    errorMessage: string;
}

export class JumpointNodesSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-nodes-sync-failed';

    constructor(transactionId: string, payload: JumpointNodesSyncFailedEventPayload) {
        super(JumpointNodesSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
