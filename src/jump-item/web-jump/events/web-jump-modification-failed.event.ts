import { BaseEvent } from '../../../core/events';
import { WebJump } from '../models';

export interface WebJumpModificationFailedEventPayload {
    errorMessage: string;
    webJump: WebJump;
    tenantId: number;
}

export class WebJumpModificationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'web-jump-modification-failed';

    constructor(transactionId: string, payload: WebJumpModificationFailedEventPayload) {
        super(WebJumpModificationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
