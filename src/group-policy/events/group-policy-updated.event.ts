import { BaseEvent } from '../../core/events';
import { GroupPolicy } from '../models';

export interface GroupPolicyUpdatedEventPayload {
    groupPolicy: GroupPolicy;
}

export class GroupPolicyUpdatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-updated';

    constructor(transactionId: string, payload: GroupPolicyUpdatedEventPayload) {
        super(GroupPolicyUpdatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
