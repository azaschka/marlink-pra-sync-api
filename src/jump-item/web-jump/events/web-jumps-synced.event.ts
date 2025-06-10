import { BaseEvent } from '../../../core/events';

export interface WebJumpsSyncedEventPayload {
    createdWebJumpIds: number[];
    updatedWebJumpIds: number[];
    deletedWebJumpIds: number[];
}

export class WebJumpsSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'web-jumps-synced';

    constructor(transactionId: string, payload: WebJumpsSyncedEventPayload) {
        super(WebJumpsSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
