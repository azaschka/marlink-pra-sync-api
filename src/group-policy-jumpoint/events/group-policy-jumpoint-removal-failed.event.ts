import { BaseEvent } from '../../core/events';

export interface GroupPolicyJumpointRemovalFailedEventPayload {
    errorMessage: string;
    groupPolicyId: number;
    jumpointId: number;
    tenantId: number;
}

export class GroupPolicyJumpointRemovalFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-jumpoint-removal-failed';

    constructor(transactionId: string, payload: GroupPolicyJumpointRemovalFailedEventPayload) {
        super(GroupPolicyJumpointRemovalFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
