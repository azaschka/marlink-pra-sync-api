import { BaseEvent } from '../../../core/events';
import { JumpointNode } from '../models';

export interface JumpointNodeApprovedEventPayload {
    jumpointNode: JumpointNode;
}

export class JumpointNodeApprovedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-node-approved';

    constructor(transactionId: string, payload: JumpointNodeApprovedEventPayload) {
        super(JumpointNodeApprovedEvent.EVENT_TYPE, payload, transactionId);
    }
}
