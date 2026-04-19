import { BaseEvent } from '../../../core/events';

export interface JumpointNodeDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
}

export class JumpointNodeDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-node-deletion-failed';

    constructor(transactionId: string, payload: JumpointNodeDeletionFailedEventPayload) {
        super(JumpointNodeDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
