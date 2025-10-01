import { BaseEvent } from '../../../core/events';
import { WebJump } from '../models';

export interface WebJumpModifiedEventPayload {
    webJump: WebJump;
    tenantId: number;
}

export class WebJumpModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'web-jump-modified';

    constructor(transactionId: string, payload: WebJumpModifiedEventPayload) {
        super(WebJumpModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
