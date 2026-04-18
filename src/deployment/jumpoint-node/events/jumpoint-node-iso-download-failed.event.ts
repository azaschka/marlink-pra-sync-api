import { BaseEvent } from '../../../core/events';

export interface JumpointNodeIsoDownloadFailedEventPayload {
    errorMessage: string;
    id: number;
}

export class JumpointNodeIsoDownloadFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jumpoint-node-iso-download-failed';

    constructor(transactionId: string, payload: JumpointNodeIsoDownloadFailedEventPayload) {
        super(JumpointNodeIsoDownloadFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
