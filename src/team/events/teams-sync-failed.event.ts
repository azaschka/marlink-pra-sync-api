import { BaseEvent } from '../../core/events';

export interface TeamsSyncFailedEventPayload {
    errorMessage: string;
    tenantId: number;
}

export class TeamsSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'teams-sync-failed';

    constructor(transactionId: string, payload: TeamsSyncFailedEventPayload) {
        super(TeamsSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
