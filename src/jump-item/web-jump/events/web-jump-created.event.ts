import { BaseEvent } from '../../../core/events';
import { WebJump } from '../models';

export interface WebJumpCreatedEventPayload {
    webJump: WebJump;
}

export class WebJumpCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'web-jump-created';

    constructor(transactionId: string, payload: WebJumpCreatedEventPayload) {
        super(WebJumpCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
