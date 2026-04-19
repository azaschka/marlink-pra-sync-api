import { BaseEvent } from '../../../core/events';

export interface JumpointNodeDeletedEventPayload {
    id: number;
}

export class JumpointNodeDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-node-deleted';

    constructor(transactionId: string, payload: JumpointNodeDeletedEventPayload) {
        super(JumpointNodeDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
