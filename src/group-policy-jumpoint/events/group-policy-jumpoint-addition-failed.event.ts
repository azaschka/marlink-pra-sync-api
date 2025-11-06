import { BaseEvent } from '../../core/events';
import { GroupPolicyJumpoint } from '../models';

export interface GroupPolicyJumpointAdditionFailedEventPayload {
    errorMessage: string;
    groupPolicyJumpoint: GroupPolicyJumpoint;
    tenantId: number;
}

export class GroupPolicyJumpointAdditionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-jumpoint-addition-failed';

    constructor(transactionId: string, payload: GroupPolicyJumpointAdditionFailedEventPayload) {
        super(GroupPolicyJumpointAdditionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
