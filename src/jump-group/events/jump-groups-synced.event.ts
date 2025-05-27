import { BaseEvent } from '../../core/events';

export interface JumpGroupsSyncedEventPayload {
    createdJumpGroupIds: number[];
    updatedJumpGroupIds: number[];
    deletedJumpGroupIds: number[];
}

export class JumpGroupsSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-groups-synced';

    constructor(transactionId: string, payload: JumpGroupsSyncedEventPayload) {
        super(JumpGroupsSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
