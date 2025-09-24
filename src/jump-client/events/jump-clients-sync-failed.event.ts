import { BaseEvent } from '../../core/events';

export interface JumpClientsSyncFailedEventPayload {
    errorMessage: string;
    tenantId: number;
}

export class JumpClientsSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-clients-sync-failed';

    constructor(transactionId: string, payload: JumpClientsSyncFailedEventPayload) {
        super(JumpClientsSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
