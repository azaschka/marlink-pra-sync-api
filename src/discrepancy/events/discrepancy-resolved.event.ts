import { BaseEvent } from '../../core/events';
import { DiscrepancySyncType } from '../enums';
import { Discrepancy } from '../models';

export interface DiscrepancyResolvedEventPayload {
    tenantId: number;
    syncType: DiscrepancySyncType;
    discrepancy: Discrepancy;
}

export class DiscrepancyResolvedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'discrepancy-resolved';

    constructor(transactionId: string, payload: DiscrepancyResolvedEventPayload) {
        super(DiscrepancyResolvedEvent.EVENT_TYPE, payload, transactionId);
    }
}
