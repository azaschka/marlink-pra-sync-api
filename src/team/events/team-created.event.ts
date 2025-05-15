import { BaseEvent } from '../../core/events';
import { Team } from '../models';

export interface TeamCreatedEventPayload {
    team: Team;
}

export class TeamCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-created';

    constructor(transactionId: string, payload: TeamCreatedEventPayload) {
        super(TeamCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
