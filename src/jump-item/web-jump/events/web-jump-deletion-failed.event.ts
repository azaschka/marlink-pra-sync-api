import { BaseEvent } from '../../../core/events';

export interface WebJumpDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
}

export class WebJumpDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'web-jump-deletion-failed';

    constructor(transactionId: string, payload: WebJumpDeletionFailedEventPayload) {
        super(WebJumpDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
