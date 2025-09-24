import { BaseEvent } from '../../core/events';
import { JumpPolicy } from '../models';

export interface JumpPolicyModificationFailedEventPayload {
    errorMessage: string;
    jumpPolicy: JumpPolicy;
    tenantId: number;
}

export class JumpPolicyModificationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-policy-modification-failed';

    constructor(transactionId: string, payload: JumpPolicyModificationFailedEventPayload) {
        super(JumpPolicyModificationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
