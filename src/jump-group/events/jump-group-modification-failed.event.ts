import { BaseEvent } from '../../core/events';
import { JumpGroup } from '../models';

export interface JumpGroupModificationFailedEventPayload {
    errorMessage: string;
    jumpGroup: JumpGroup;
    tenantId: number;
}

export class JumpGroupModificationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-group-modification-failed';

    constructor(transactionId: string, payload: JumpGroupModificationFailedEventPayload) {
        super(JumpGroupModificationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
