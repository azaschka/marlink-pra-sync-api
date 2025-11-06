import { BaseEvent } from '../../../core/events';

export interface WebJumpDeletedEventPayload {
    id: number;
    tenantId: number;
}

export class WebJumpDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'web-jump-deleted';

    constructor(transactionId: string, payload: WebJumpDeletedEventPayload) {
        super(WebJumpDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
