import { BaseEvent } from '../../core/events';
import { JumpPolicy } from '../models';

export interface JumpPolicyCreatedEventPayload {
    jumpPolicy: JumpPolicy;
    tenantId: number;
}

export class JumpPolicyCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-policy-created';

    constructor(transactionId: string, payload: JumpPolicyCreatedEventPayload) {
        super(JumpPolicyCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
