import { BaseEvent } from '../../core/events';

export interface GroupPoliciesSyncedEventPayload {
    createdGroupPolicyIds: number[];
    updatedGroupPolicyIds: number[];
    deletedGroupPolicyIds: number[];
}

export class GroupPoliciesSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policies-synced';

    constructor(transactionId: string, payload: GroupPoliciesSyncedEventPayload) {
        super(GroupPoliciesSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
