import { BaseEvent } from '../../core/events';

export interface JumpGroupDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
}

export class JumpGroupDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-group-deletion-failed';

    constructor(transactionId: string, payload: JumpGroupDeletionFailedEventPayload) {
        super(JumpGroupDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
