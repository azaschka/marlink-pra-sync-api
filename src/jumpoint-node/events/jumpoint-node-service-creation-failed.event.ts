import { BaseEvent } from '../../core/events';
import { JumpointNodeServiceType } from '../enums';

export interface JumpointNodeServiceCreationFailedEventPayload {
    errorMessage: string;
    id: number;
    serviceType: JumpointNodeServiceType;
}

export class JumpointNodeServiceCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-node-service-creation-failed';

    constructor(transactionId: string, payload: JumpointNodeServiceCreationFailedEventPayload) {
        super(JumpointNodeServiceCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
