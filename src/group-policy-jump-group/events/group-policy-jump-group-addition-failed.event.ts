import { BaseEvent } from '../../core/events';
import { GroupPolicyJumpGroup } from '../models';

export interface GroupPolicyJumpGroupAdditionFailedEventPayload {
    errorMessage: string;
    groupPolicyJumpGroup: GroupPolicyJumpGroup;
    tenantId: number;
}

export class GroupPolicyJumpGroupAdditionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-jump-group-addition-failed';

    constructor(transactionId: string, payload: GroupPolicyJumpGroupAdditionFailedEventPayload) {
        super(GroupPolicyJumpGroupAdditionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
