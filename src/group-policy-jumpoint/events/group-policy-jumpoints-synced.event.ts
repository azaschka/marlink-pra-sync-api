import { BaseEvent } from '../../core/events';
import { GroupPolicyJumpoints } from '../models';

export interface GroupPolicyJumpointsSyncedEventPayload {
    groupPolicyJumpoints: GroupPolicyJumpoints;
}

export class GroupPolicyJumpointsSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-jumpoints-synced';

    constructor(transactionId: string, payload: GroupPolicyJumpointsSyncedEventPayload) {
        super(GroupPolicyJumpointsSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
