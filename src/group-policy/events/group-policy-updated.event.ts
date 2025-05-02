import { BaseEvent } from '../../core/events';
import { GroupPolicyUpdated } from '../models';

export type GroupPolicyUpdatedEventPayload = Partial<GroupPolicyUpdated>;

export class GroupPolicyUpdatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-updated';

    constructor(transactionId: string, payload: GroupPolicyUpdatedEventPayload) {
        super(GroupPolicyUpdatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
