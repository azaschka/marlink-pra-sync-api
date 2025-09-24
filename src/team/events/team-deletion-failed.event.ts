import { BaseEvent } from '../../core/events';

export interface TeamDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
    tenantId: number;
}

export class TeamDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-deletion-failed';

    constructor(transactionId: string, payload: TeamDeletionFailedEventPayload) {
        super(TeamDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
