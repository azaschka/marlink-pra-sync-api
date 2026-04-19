import { BaseEvent } from '../../../core/events';
import { JumpointNode } from '../models';

export interface JumpointNodeServiceCreatedEventPayload {
    jumpointNode: JumpointNode;
}

export class JumpointNodeServiceCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-node-service-created';

    constructor(transactionId: string, payload: JumpointNodeServiceCreatedEventPayload) {
        super(JumpointNodeServiceCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
