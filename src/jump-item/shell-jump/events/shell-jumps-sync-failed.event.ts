import { BaseEvent } from '../../../core/events';

export interface ShellJumpsSyncFailedEventPayload {
    errorMessage: string;
}

export class ShellJumpsSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'shell-jumps-sync-failed';

    constructor(transactionId: string, payload: ShellJumpsSyncFailedEventPayload) {
        super(ShellJumpsSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
