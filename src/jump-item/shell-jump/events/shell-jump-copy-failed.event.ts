import { BaseEvent } from '../../../core/events';
import { ShellJump } from '../models';

export interface ShellJumpCopyFailedEventPayload {
    errorMessage: string;
    shellJump: ShellJump;
    tenantId: number;
}

export class ShellJumpCopyFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'shell-jump-copy-failed';

    constructor(transactionId: string, payload: ShellJumpCopyFailedEventPayload) {
        super(ShellJumpCopyFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
