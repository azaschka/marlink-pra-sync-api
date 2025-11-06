import { BaseEvent } from '../../core/events';
import { GroupPolicyJumpGroup } from '../models';

export interface GroupPolicyJumpGroupAddedEventPayload {
    groupPolicyJumpGroup: GroupPolicyJumpGroup;
    tenantId: number;
}

export class GroupPolicyJumpGroupAddedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-jump-group-added';

    constructor(transactionId: string, payload: GroupPolicyJumpGroupAddedEventPayload) {
        super(GroupPolicyJumpGroupAddedEvent.EVENT_TYPE, payload, transactionId);
    }
}
