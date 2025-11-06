import { BaseEvent } from '../../core/events';

export interface GroupPolicyJumpointsSyncFailedEventPayload {
    errorMessage: string;
    tenantId: number;
}

export class GroupPolicyJumpointsSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-jumpoints-sync-failed';

    constructor(transactionId: string, payload: GroupPolicyJumpointsSyncFailedEventPayload) {
        super(GroupPolicyJumpointsSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
