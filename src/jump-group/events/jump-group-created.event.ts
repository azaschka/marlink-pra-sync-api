import { BaseEvent } from '../../core/events';
import { JumpGroup } from '../models';

export interface JumpGroupCreatedEventPayload {
    jumpGroup: JumpGroup;
    tenantId: number;
}

export class JumpGroupCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-group-created';

    constructor(transactionId: string, payload: JumpGroupCreatedEventPayload) {
        super(JumpGroupCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
