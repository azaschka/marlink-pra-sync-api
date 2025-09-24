import { BaseEvent } from '../../../core/events';
import { ShellJump } from '../models';

export interface ShellJumpModifiedEventPayload {
    shellJump: ShellJump;
    tenantId: number;
}

export class ShellJumpModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'shell-jump-modified';

    constructor(transactionId: string, payload: ShellJumpModifiedEventPayload) {
        super(ShellJumpModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
