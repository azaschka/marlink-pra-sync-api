import { BaseEvent } from '../../core/events';

export interface GroupPolicyJumpGroupRemovalFailedEventPayload {
    errorMessage: string;
    groupPolicyId: number;
    jumpGroupId: number;
}

export class GroupPolicyJumpGroupRemovalFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-jump-group-removal-failed';

    constructor(transactionId: string, payload: GroupPolicyJumpGroupRemovalFailedEventPayload) {
        super(GroupPolicyJumpGroupRemovalFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
