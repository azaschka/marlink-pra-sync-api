import { BaseEvent } from '../../core/events';
import { GroupPolicy } from '../models';

export interface GroupPolicyCreationFailedEventPayload {
    error: unknown;
    groupPolicy: GroupPolicy;
}

export class GroupPolicyCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-creation-failed';

    constructor(transactionId: string, payload: GroupPolicyCreationFailedEventPayload) {
        super(GroupPolicyCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
