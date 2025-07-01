import { BaseEvent } from '../../core/events';
import { JumpClient } from '../models';

export interface JumpClientCopiedEventPayload {
    jumpClient: JumpClient;
}

export class JumpClientCopiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-client-copied';

    constructor(transactionId: string, payload: JumpClientCopiedEventPayload) {
        super(JumpClientCopiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
