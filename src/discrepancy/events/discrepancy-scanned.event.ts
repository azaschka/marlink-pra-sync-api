import { BaseEvent } from '../../core/events';
import { DiscrepancyOverview } from '../models';

export interface DiscrepancyScannedEventPayload {
    tenantId: number;
    discrepancyOverview: DiscrepancyOverview;
}

export class DiscrepancyScannedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'discrepancy-scanned';

    constructor(
        transactionId: string,
        public payload: DiscrepancyScannedEventPayload,
    ) {
        super(DiscrepancyScannedEvent.EVENT_TYPE, payload, transactionId);
    }
}
