import { BaseEvent } from '../../core/events';
import { Jumpoint } from '../models';

export interface JumpointModifiedEventPayload {
    jumpoint: Jumpoint;
}

export class JumpointModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-modified';

    constructor(transactionId: string, payload: JumpointModifiedEventPayload) {
        super(JumpointModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
