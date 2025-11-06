import { BaseEvent } from '../../core/events';

export interface JumpointDeletedEventPayload {
    id: number;
    tenantId: number;
}

export class JumpointDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-deleted';

    constructor(transactionId: string, payload: JumpointDeletedEventPayload) {
        super(JumpointDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
