import { BaseEvent } from '../../core/events';
import { GroupPolicyJumpGroup } from '../models';

export interface GroupPolicyJumpGroupsSyncedEventPayload {
    groupPolicyJumpGroups: GroupPolicyJumpGroup[];
}

export class GroupPolicyJumpGroupsSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-jump-groups-synced';

    constructor(transactionId: string, payload: GroupPolicyJumpGroupsSyncedEventPayload) {
        super(GroupPolicyJumpGroupsSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
