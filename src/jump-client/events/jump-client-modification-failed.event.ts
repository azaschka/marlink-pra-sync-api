import { BaseEvent } from '../../core/events';
import { JumpClient } from '../models';

export interface JumpClientModificationFailedEventPayload {
    errorMessage: string;
    jumpClient: JumpClient;
}

export class JumpClientModificationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-client-modification-failed';

    constructor(transactionId: string, payload: JumpClientModificationFailedEventPayload) {
        super(JumpClientModificationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
