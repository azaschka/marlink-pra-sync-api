import { BaseEvent } from '../../core/events';
import { BeyondtrustInstance } from '../models';

export interface BeyondtrustInstanceCreatedEventPayload {
    beyondtrustInstance: BeyondtrustInstance;
}

export class BeyondtrustInstanceCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'beyondtrust-instance-created';

    constructor(transactionId: string, payload: BeyondtrustInstanceCreatedEventPayload) {
        super(BeyondtrustInstanceCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
