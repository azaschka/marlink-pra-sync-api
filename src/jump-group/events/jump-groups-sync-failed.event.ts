import { BaseEvent } from '../../core/events';

export interface JumpGroupsSyncFailedEventPayload {
    errorMessage: string;
}

export class JumpGroupsSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-groups-sync-failed';

    constructor(transactionId: string, payload: JumpGroupsSyncFailedEventPayload) {
        super(JumpGroupsSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
