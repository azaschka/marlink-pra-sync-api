import { BaseEvent } from '../../core/events';

export interface GroupPolicyJumpointRemovedEventPayload {
    groupPolicyId: number;
    jumpointId: number;
    tenantId: number;
}

export class GroupPolicyJumpointRemovedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-jumpoint-removed';

    constructor(transactionId: string, payload: GroupPolicyJumpointRemovedEventPayload) {
        super(GroupPolicyJumpointRemovedEvent.EVENT_TYPE, payload, transactionId);
    }
}
