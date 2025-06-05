import { BaseEvent } from '../../core/events';
import { UserGroupPolicies } from '../models';

export interface UserGroupPoliciesSyncedEventPayload {
    userGroupPolicies: UserGroupPolicies;
}

export class UserGroupPoliciesSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'user-group-policies-synced';

    constructor(transactionId: string, payload: UserGroupPoliciesSyncedEventPayload) {
        super(UserGroupPoliciesSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
