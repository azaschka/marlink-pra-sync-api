import { BaseEvent } from '../../core/events';
import { GroupPolicy } from '../models';

export interface GroupPolicyUpdateFailedEventPayload {
    errorMessage: string;
    groupPolicy: GroupPolicy;
}

export class GroupPolicyUpdateFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-update-failed';

    constructor(transactionId: string, payload: GroupPolicyUpdateFailedEventPayload) {
        super(GroupPolicyUpdateFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
