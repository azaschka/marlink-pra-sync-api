import { BaseEvent } from '../../core/events';

export interface JumpointDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
    tenantId: number;
}

export class JumpointDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-deletion-failed';

    constructor(transactionId: string, payload: JumpointDeletionFailedEventPayload) {
        super(JumpointDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
