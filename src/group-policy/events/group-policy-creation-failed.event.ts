import { BaseEvent } from '../../core/events';
import { GroupPolicy } from '../models';

export interface GroupPolicyCreationFailedEventPayload {
    errorMessage: string;
    groupPolicy: GroupPolicy;
    tenantId: number;
}

export class GroupPolicyCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-creation-failed';

    constructor(transactionId: string, payload: GroupPolicyCreationFailedEventPayload) {
        super(GroupPolicyCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
