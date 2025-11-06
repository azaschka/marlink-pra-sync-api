import { BaseEvent } from '../../core/events';
import { GroupPolicyJumpoint } from '../models';

export interface GroupPolicyJumpointAddedEventPayload {
    groupPolicyJumpoint: GroupPolicyJumpoint;
    tenantId: number;
}

export class GroupPolicyJumpointAddedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-jumpoint-added';

    constructor(transactionId: string, payload: GroupPolicyJumpointAddedEventPayload) {
        super(GroupPolicyJumpointAddedEvent.EVENT_TYPE, payload, transactionId);
    }
}
