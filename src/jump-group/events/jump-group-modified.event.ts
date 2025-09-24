import { BaseEvent } from '../../core/events';
import { JumpGroup } from '../models';

export interface JumpGroupModifiedEventPayload {
    jumpGroup: JumpGroup;
    tenantId: number;
}

export class JumpGroupModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-group-modified';

    constructor(transactionId: string, payload: JumpGroupModifiedEventPayload) {
        super(JumpGroupModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
