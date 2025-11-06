import { BaseEvent } from '../../core/events';

export interface GroupPolicyMemberRemovalFailedEventPayload {
    errorMessage: string;
    groupPolicyId: number;
    memberId: number;
    tenantId: number;
}

export class GroupPolicyMemberRemovalFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-member-removal-failed';

    constructor(transactionId: string, payload: GroupPolicyMemberRemovalFailedEventPayload) {
        super(GroupPolicyMemberRemovalFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
