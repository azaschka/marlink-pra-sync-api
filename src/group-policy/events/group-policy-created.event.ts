import { BaseEvent } from '../../core/events';
import { GroupPolicy } from '../models';

export interface GroupPolicyCreatedEventPayload {
    groupPolicy: GroupPolicy;
}

export class GroupPolicyCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-created';

    constructor(transactionId: string, payload: GroupPolicyCreatedEventPayload) {
        super(GroupPolicyCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
