import { BaseEvent } from '../../core/events';
import { GroupPolicyCreated } from '../models';

export type GroupPolicyCreatedEventPayload = GroupPolicyCreated;

export class GroupPolicyCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-created';

    constructor(transactionId: string, payload: GroupPolicyCreatedEventPayload) {
        super(GroupPolicyCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
