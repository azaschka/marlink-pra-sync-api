import { BaseEvent } from '../../core/events';
import { TeamUser } from '../models';

export interface TeamUsersSyncedEventPayload {
    teamUsers: TeamUser[];
    tenantId: number;
}

export class TeamUsersSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-users-synced';

    constructor(transactionId: string, payload: TeamUsersSyncedEventPayload) {
        super(TeamUsersSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
