import { BaseEvent } from '../../core/events';

export interface JumpPolicyDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
}

export class JumpPolicyDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-policy-deletion-failed';

    constructor(transactionId: string, payload: JumpPolicyDeletionFailedEventPayload) {
        super(JumpPolicyDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
