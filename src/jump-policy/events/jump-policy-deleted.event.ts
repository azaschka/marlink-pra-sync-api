import { BaseEvent } from '../../core/events';

export interface JumpPolicyDeletedEventPayload {
    id: number;
    tenantId: number;
}

export class JumpPolicyDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-policy-deleted';

    constructor(transactionId: string, payload: JumpPolicyDeletedEventPayload) {
        super(JumpPolicyDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
