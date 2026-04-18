import { BaseEvent } from '../../../core/events';
import { JumpointNode } from '../models';

export interface JumpointNodeCreatedEventPayload {
    jumpointNode: JumpointNode;
}

export class JumpointNodeCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-node-created';

    constructor(transactionId: string, payload: JumpointNodeCreatedEventPayload) {
        super(JumpointNodeCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
