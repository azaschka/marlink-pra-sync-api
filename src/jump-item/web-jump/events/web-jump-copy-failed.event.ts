import { BaseEvent } from '../../../core/events';
import { WebJump } from '../models';

export interface WebJumpCopyFailedEventPayload {
    errorMessage: string;
    webJump: WebJump;
    tenantId: number;
}

export class WebJumpCopyFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'web-jump-copy-failed';

    constructor(transactionId: string, payload: WebJumpCopyFailedEventPayload) {
        super(WebJumpCopyFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
