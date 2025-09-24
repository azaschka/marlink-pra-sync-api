import { BaseEvent } from '../../core/events';
import { GroupPolicyMember } from '../models';

export interface GroupPolicyMemberAddedEventPayload {
    groupPolicyMember: GroupPolicyMember;
    tenantId: number;
}

export class GroupPolicyMemberAddedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-member-added';

    constructor(transactionId: string, payload: GroupPolicyMemberAddedEventPayload) {
        super(GroupPolicyMemberAddedEvent.EVENT_TYPE, payload, transactionId);
    }
}
