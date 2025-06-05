import { BaseEvent } from '../../core/events';

export interface UserGroupPoliciesModificationFailedEventPayload {
    errorMessage: string;
    userId: number;
    groupPolicyIdsToAdd: number[];
    groupPolicyIdsToRemove: number[];
}

export class UserGroupPoliciesModificationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-group-policies-modification-failed';

    constructor(transactionId: string, payload: UserGroupPoliciesModificationFailedEventPayload) {
        super(UserGroupPoliciesModificationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
