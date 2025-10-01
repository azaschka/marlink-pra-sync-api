import { BaseEvent } from '../../core/events';
import { TeamUser } from '../models';

export interface TeamUserAddedEventPayload {
    teamUser: TeamUser;
    tenantId: number;
}

export class TeamUserAddedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-user-added';

    constructor(transactionId: string, payload: TeamUserAddedEventPayload) {
        super(TeamUserAddedEvent.EVENT_TYPE, payload, transactionId);
    }
}
