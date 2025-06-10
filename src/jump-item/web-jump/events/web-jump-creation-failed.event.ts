import { BaseEvent } from '../../../core/events';
import { WebJump } from '../models';

export interface WebJumpCreationFailedEventPayload {
    errorMessage: string;
    webJump: WebJump;
}

export class WebJumpCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'web-jump-creation-failed';

    constructor(transactionId: string, payload: WebJumpCreationFailedEventPayload) {
        super(WebJumpCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
