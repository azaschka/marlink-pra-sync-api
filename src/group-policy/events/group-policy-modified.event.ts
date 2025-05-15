import { BaseEvent } from '../../core/events';
import { GroupPolicy } from '../models';

export interface GroupPolicyModifiedEventPayload {
    groupPolicy: GroupPolicy;
}

export class GroupPolicyModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-modified';

    constructor(transactionId: string, payload: GroupPolicyModifiedEventPayload) {
        super(GroupPolicyModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
