import { BaseEvent } from '../../core/events';

export interface JumpGroupDeletedEventPayload {
    id: number;
    tenantId: number;
}

export class JumpGroupDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-group-deleted';

    constructor(transactionId: string, payload: JumpGroupDeletedEventPayload) {
        super(JumpGroupDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
