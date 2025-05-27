import { BaseEvent } from '../../core/events';

export interface TeamsSyncedEventPayload {
    createdTeamIds: number[];
    updatedTeamIds: number[];
    deletedTeamIds: number[];
}

export class TeamsSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'teams-synced';

    constructor(transactionId: string, payload: TeamsSyncedEventPayload) {
        super(TeamsSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
