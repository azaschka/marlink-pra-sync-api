import { BaseEvent } from '../../core/events';

export interface JumpClientDeletedEventPayload {
    id: number;
    tenantId: number;
}

export class JumpClientDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-client-deleted';

    constructor(transactionId: string, payload: JumpClientDeletedEventPayload) {
        super(JumpClientDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
