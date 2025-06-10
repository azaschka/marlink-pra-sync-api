import { BaseEvent } from '../../../core/events';

export interface ShellJumpDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
}

export class ShellJumpDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'shell-jump-deletion-failed';

    constructor(transactionId: string, payload: ShellJumpDeletionFailedEventPayload) {
        super(ShellJumpDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
