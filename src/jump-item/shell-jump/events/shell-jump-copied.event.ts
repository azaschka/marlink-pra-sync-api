import { BaseEvent } from '../../../core/events';
import { ShellJump } from '../models';

export interface ShellJumpCopiedEventPayload {
    shellJump: ShellJump;
}

export class ShellJumpCopiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'shell-jump-copied';

    constructor(transactionId: string, payload: ShellJumpCopiedEventPayload) {
        super(ShellJumpCopiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
