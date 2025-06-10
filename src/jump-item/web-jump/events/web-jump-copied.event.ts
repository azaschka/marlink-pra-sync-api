import { BaseEvent } from '../../../core/events';
import { WebJump } from '../models';

export interface WebJumpCopiedEventPayload {
    webJump: WebJump;
}

export class WebJumpCopiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'web-jump-copied';

    constructor(transactionId: string, payload: WebJumpCopiedEventPayload) {
        super(WebJumpCopiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
