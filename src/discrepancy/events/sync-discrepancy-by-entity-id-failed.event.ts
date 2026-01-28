import { BaseEvent } from '../../core/events';

export interface SyncDiscrepancyByEntityIdFailedEventPayload {
    errorMessage: string;
    tenantId: number;
}

export class SyncDiscrepancyByEntityIdFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'sync-discrepancy-by-entity-id-failed';

    constructor(transactionId: string, payload: SyncDiscrepancyByEntityIdFailedEventPayload) {
        super(SyncDiscrepancyByEntityIdFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
