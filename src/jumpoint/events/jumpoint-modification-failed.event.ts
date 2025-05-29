import { BaseEvent } from '../../core/events';
import { Jumpoint } from '../models';

export interface JumpointModificationFailedEventPayload {
    errorMessage: string;
    jumpoint: Jumpoint;
}

export class JumpointModificationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-modification-failed';

    constructor(transactionId: string, payload: JumpointModificationFailedEventPayload) {
        super(JumpointModificationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
