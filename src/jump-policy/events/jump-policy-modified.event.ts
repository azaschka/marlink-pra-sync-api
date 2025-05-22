import { BaseEvent } from '../../core/events';
import { JumpPolicy } from '../models';

export interface JumpPolicyModifiedEventPayload {
    jumpPolicy: JumpPolicy;
}

export class JumpPolicyModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-policy-modified';

    constructor(transactionId: string, payload: JumpPolicyModifiedEventPayload) {
        super(JumpPolicyModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
