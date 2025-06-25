import { BaseEvent } from '../../core/events';

export interface BeyondtrustInstanceDeletedEventPayload {
    id: number;
}

export class BeyondtrustInstanceDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'beyondtrust-instance-deleted';

    constructor(transactionId: string, payload: BeyondtrustInstanceDeletedEventPayload) {
        super(BeyondtrustInstanceDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
