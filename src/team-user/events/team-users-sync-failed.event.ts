import { BaseEvent } from '../../core/events';

export interface TeamUsersSyncFailedEventPayload {
    errorMessage: string;
    tenantId: number;
}

export class TeamUsersSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-users-sync-failed';

    constructor(transactionId: string, payload: TeamUsersSyncFailedEventPayload) {
        super(TeamUsersSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
