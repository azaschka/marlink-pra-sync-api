import { BaseEvent } from '../../core/events';

export interface JumpointNodeApprovalFailedEventPayload {
    errorMessage: string;
    id: number;
}

export class JumpointNodeApprovalFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-node-approval-failed';

    constructor(transactionId: string, payload: JumpointNodeApprovalFailedEventPayload) {
        super(JumpointNodeApprovalFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
