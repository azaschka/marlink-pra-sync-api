import { BaseEvent } from '../../core/events';
import { GroupPolicy } from '../models';

export interface GroupPolicyModificationFailedEventPayload {
    errorMessage: string;
    groupPolicy: GroupPolicy;
}

export class GroupPolicyModificationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-modification-failed';

    constructor(transactionId: string, payload: GroupPolicyModificationFailedEventPayload) {
        super(GroupPolicyModificationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
