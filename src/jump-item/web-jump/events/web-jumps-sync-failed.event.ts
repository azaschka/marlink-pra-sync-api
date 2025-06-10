import { BaseEvent } from '../../../core/events';

export interface WebJumpsSyncFailedEventPayload {
    errorMessage: string;
}

export class WebJumpsSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'web-jumps-sync-failed';

    constructor(transactionId: string, payload: WebJumpsSyncFailedEventPayload) {
        super(WebJumpsSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
