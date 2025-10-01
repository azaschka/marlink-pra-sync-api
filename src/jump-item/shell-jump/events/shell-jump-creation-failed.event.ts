import { BaseEvent } from '../../../core/events';
import { ShellJump } from '../models';

export interface ShellJumpCreationFailedEventPayload {
    errorMessage: string;
    shellJump: ShellJump;
    tenantId: number;
}

export class ShellJumpCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'shell-jump-creation-failed';

    constructor(transactionId: string, payload: ShellJumpCreationFailedEventPayload) {
        super(ShellJumpCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
