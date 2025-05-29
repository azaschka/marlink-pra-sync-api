import { BaseEvent } from '../../core/events';
import { Jumpoint } from '../models';

export interface JumpointCreatedEventPayload {
    jumpoint: Jumpoint;
}

export class JumpointCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-created';

    constructor(transactionId: string, payload: JumpointCreatedEventPayload) {
        super(JumpointCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
