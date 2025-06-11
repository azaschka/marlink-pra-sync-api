import { BaseEvent } from '../../core/events';
import { TeamUsers } from '../models';

export interface TeamUsersSyncedEventPayload {
    teamUsers: TeamUsers;
}

export class TeamUsersSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-users-synced';

    constructor(transactionId: string, payload: TeamUsersSyncedEventPayload) {
        super(TeamUsersSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
