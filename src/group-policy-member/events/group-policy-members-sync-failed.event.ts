import { BaseEvent } from '../../core/events';

export interface GroupPolicyMembersSyncFailedEventPayload {
    errorMessage: string;
    tenantId: number;
}

export class GroupPolicyMembersSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-members-sync-failed';

    constructor(transactionId: string, payload: GroupPolicyMembersSyncFailedEventPayload) {
        super(GroupPolicyMembersSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
