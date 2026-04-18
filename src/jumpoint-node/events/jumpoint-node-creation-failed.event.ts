import { BaseEvent } from '../../core/events';
import { JumpointNodeBusinessUnit, JumpointNodeHypervisorType } from '../enums';

export interface JumpointNodeCreationFailedEventPayload {
    errorMessage: string;
    siteKey: string;
    businessUnit: JumpointNodeBusinessUnit;
    hypervisorId?: string;
    hypervisorType?: JumpointNodeHypervisorType;
    vmId?: number;
}

export class JumpointNodeCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-node-creation-failed';

    constructor(transactionId: string, payload: JumpointNodeCreationFailedEventPayload) {
        super(JumpointNodeCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
