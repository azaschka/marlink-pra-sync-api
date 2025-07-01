import { BaseEvent } from '../../core/events';
import { JumpClient } from '../models';

export interface JumpClientModifiedEventPayload {
    jumpClient: JumpClient;
}

export class JumpClientModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-client-modified';

    constructor(transactionId: string, payload: JumpClientModifiedEventPayload) {
        super(JumpClientModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
