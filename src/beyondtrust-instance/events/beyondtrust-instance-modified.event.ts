import { BaseEvent } from '../../core/events';
import { BeyondtrustInstance } from '../models';

export interface BeyondtrustInstanceModifiedEventPayload {
    beyondtrustInstance: BeyondtrustInstance;
}

export class BeyondtrustInstanceModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'beyondtrust-instance-modified';

    constructor(transactionId: string, payload: BeyondtrustInstanceModifiedEventPayload) {
        super(BeyondtrustInstanceModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
