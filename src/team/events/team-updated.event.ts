import { BaseEvent } from '../../core/events';
import { Team } from '../models';

export interface TeamUpdatedEventPayload {
    team: Team;
}

export class TeamUpdatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-updated';

    constructor(transactionId: string, payload: TeamUpdatedEventPayload) {
        super(TeamUpdatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
