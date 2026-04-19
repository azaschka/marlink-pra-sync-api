import { BaseEvent } from '../../../core/events';
import { JumpointNode } from '../models';

export interface JumpointNodeIsoDownloadedEventPayload {
    jumpointNode: JumpointNode;
}

export class JumpointNodeIsoDownloadedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-node-iso-downloaded';

    constructor(transactionId: string, payload: JumpointNodeIsoDownloadedEventPayload) {
        super(JumpointNodeIsoDownloadedEvent.EVENT_TYPE, payload, transactionId);
    }
}
