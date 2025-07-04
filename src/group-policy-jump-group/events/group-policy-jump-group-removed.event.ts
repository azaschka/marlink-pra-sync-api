import { BaseEvent } from '../../core/events';

export interface GroupPolicyJumpGroupRemovedEventPayload {
    groupPolicyId: number;
    jumpGroupId: number;
}

export class GroupPolicyJumpGroupRemovedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-jump-group-removed';

    constructor(transactionId: string, payload: GroupPolicyJumpGroupRemovedEventPayload) {
        super(GroupPolicyJumpGroupRemovedEvent.EVENT_TYPE, payload, transactionId);
    }
}
