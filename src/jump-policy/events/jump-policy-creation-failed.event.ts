import { BaseEvent } from '../../core/events';
import { JumpPolicy } from '../models';

export interface JumpPolicyCreationFailedEventPayload {
    errorMessage: string;
    jumpPolicy: JumpPolicy;
    tenantId: number;
}

export class JumpPolicyCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-policy-creation-failed';

    constructor(transactionId: string, payload: JumpPolicyCreationFailedEventPayload) {
        super(JumpPolicyCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
