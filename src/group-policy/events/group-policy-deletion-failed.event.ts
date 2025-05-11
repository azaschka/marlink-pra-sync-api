import { BaseEvent } from '../../core/events';

export interface GroupPolicyDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
}

export class GroupPolicyDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-deletion-failed';

    constructor(transactionId: string, payload: GroupPolicyDeletionFailedEventPayload) {
        super(GroupPolicyDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
