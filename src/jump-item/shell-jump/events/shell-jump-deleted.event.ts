import { BaseEvent } from '../../../core/events';

export interface ShellJumpDeletedEventPayload {
    id: number;
    tenantId: number;
}

export class ShellJumpDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'shell-jump-deleted';

    constructor(transactionId: string, payload: ShellJumpDeletedEventPayload) {
        super(ShellJumpDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
