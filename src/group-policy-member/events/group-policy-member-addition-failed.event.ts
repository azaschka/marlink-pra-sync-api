import { BaseEvent } from '../../core/events';
import { GroupPolicyMember } from '../models';

export interface GroupPolicyMemberAdditionFailedEventPayload {
    errorMessage: string;
    groupPolicyMember: GroupPolicyMember;
}

export class GroupPolicyMemberAdditionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-member-addition-failed';

    constructor(transactionId: string, payload: GroupPolicyMemberAdditionFailedEventPayload) {
        super(GroupPolicyMemberAdditionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
