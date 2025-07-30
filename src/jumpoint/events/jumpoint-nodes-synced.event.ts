import { BaseEvent } from '../../core/events';
import { JumpointNode } from '../models';

export interface JumpointNodesSyncedEventPayload {
    jumpointNodes: JumpointNode[];
}

export class JumpointNodesSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-nodes-synced';

    constructor(transactionId: string, payload: JumpointNodesSyncedEventPayload) {
        super(JumpointNodesSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
