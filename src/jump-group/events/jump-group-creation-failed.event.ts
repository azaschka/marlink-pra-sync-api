import { BaseEvent } from '../../core/events';
import { JumpGroup } from '../models';

export interface JumpGroupCreationFailedEventPayload {
    errorMessage: string;
    jumpGroup: JumpGroup;
    tenantId: number;
}

export class JumpGroupCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-group-creation-failed';

    constructor(transactionId: string, payload: JumpGroupCreationFailedEventPayload) {
        super(JumpGroupCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
