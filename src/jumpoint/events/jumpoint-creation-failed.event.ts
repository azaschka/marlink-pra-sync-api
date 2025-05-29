import { BaseEvent } from '../../core/events';
import { Jumpoint } from '../models';

export interface JumpointCreationFailedEventPayload {
    errorMessage: string;
    jumpoint: Jumpoint;
}

export class JumpointCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-creation-failed';

    constructor(transactionId: string, payload: JumpointCreationFailedEventPayload) {
        super(JumpointCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
