import { BaseEvent } from '../../core/events';

export interface GroupPolicyDeletedEventPayload {
    id: number;
    tenantId: number;
}

export class GroupPolicyDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-deleted';

    constructor(transactionId: string, payload: GroupPolicyDeletedEventPayload) {
        super(GroupPolicyDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
