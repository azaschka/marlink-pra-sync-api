import { BaseEvent } from '../../core/events';
import { GroupPolicyMember } from '../models';

export interface GroupPolicyMembersSyncedEventPayload {
    groupPolicyMembers: GroupPolicyMember[];
    tenantId: number;
}

export class GroupPolicyMembersSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-members-synced';

    constructor(transactionId: string, payload: GroupPolicyMembersSyncedEventPayload) {
        super(GroupPolicyMembersSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
