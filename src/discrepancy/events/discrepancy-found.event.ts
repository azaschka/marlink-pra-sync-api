import { BaseEvent } from '../../core/events';
import { DiscrepancyOverview } from '../models';

export interface DiscrepancyFoundEventPayload {
    tenantId: number;
    discrepancyOverview: DiscrepancyOverview;
}

export class DiscrepancyFoundEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'discrepancy-found';

    constructor(
        transactionId: string,
        public payload: DiscrepancyFoundEventPayload,
    ) {
        super(DiscrepancyFoundEvent.EVENT_TYPE, payload, transactionId);
    }
}
