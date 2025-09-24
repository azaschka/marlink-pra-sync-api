import { BaseEvent } from '../../../core/events';
import { ShellJump } from '../models';

export interface ShellJumpModificationFailedEventPayload {
    errorMessage: string;
    shellJump: ShellJump;
    tenantId: number;
}

export class ShellJumpModificationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'shell-jump-modification-failed';

    constructor(transactionId: string, payload: ShellJumpModificationFailedEventPayload) {
        super(ShellJumpModificationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
