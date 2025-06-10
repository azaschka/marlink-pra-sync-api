import { BaseEvent } from '../../../core/events';
import { ShellJump } from '../models';

export interface ShellJumpCreatedEventPayload {
    shellJump: ShellJump;
}

export class ShellJumpCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'shell-jump-created';

    constructor(transactionId: string, payload: ShellJumpCreatedEventPayload) {
        super(ShellJumpCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
