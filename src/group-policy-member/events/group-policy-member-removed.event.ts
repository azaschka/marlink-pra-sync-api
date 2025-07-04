import { BaseEvent } from '../../core/events';

export interface GroupPolicyMemberRemovedEventPayload {
    groupPolicyId: number;
    memberId: number;
}

export class GroupPolicyMemberRemovedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-member-removed';

    constructor(transactionId: string, payload: GroupPolicyMemberRemovedEventPayload) {
        super(GroupPolicyMemberRemovedEvent.EVENT_TYPE, payload, transactionId);
    }
}
