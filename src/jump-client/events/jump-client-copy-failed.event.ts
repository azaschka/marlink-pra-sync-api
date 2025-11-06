import { BaseEvent } from '../../core/events';
import { JumpClient } from '../models';

export interface JumpClientCopyFailedEventPayload {
    errorMessage: string;
    jumpClient: JumpClient;
    tenantId: number;
}

export class JumpClientCopyFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-client-copy-failed';

    constructor(transactionId: string, payload: JumpClientCopyFailedEventPayload) {
        super(JumpClientCopyFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
