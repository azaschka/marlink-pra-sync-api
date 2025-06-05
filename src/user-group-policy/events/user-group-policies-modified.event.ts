import { BaseEvent } from '../../core/events';
import { UserGroupPolicies } from '../models';

export interface UserGroupPoliciesModifiedEventPayload {
    userGroupPolicies: UserGroupPolicies;
}

export class UserGroupPoliciesModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-group-policies-modified';

    constructor(transactionId: string, payload: UserGroupPoliciesModifiedEventPayload) {
        super(UserGroupPoliciesModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
