import { BaseEvent } from '../../core/events';

export interface GroupPolicyJumpGroupsSyncFailedEventPayload {
    errorMessage: string;
}

export class GroupPolicyJumpGroupsSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-jump-groups-sync-failed';

    constructor(transactionId: string, payload: GroupPolicyJumpGroupsSyncFailedEventPayload) {
        super(GroupPolicyJumpGroupsSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
