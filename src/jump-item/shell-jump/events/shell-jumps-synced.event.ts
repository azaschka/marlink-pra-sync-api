import { BaseEvent } from '../../../core/events';

export interface ShellJumpsSyncedEventPayload {
    createdShellJumpIds: number[];
    updatedShellJumpIds: number[];
    deletedShellJumpIds: number[];
}

export class ShellJumpsSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'shell-jumps-synced';

    constructor(transactionId: string, payload: ShellJumpsSyncedEventPayload) {
        super(ShellJumpsSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
