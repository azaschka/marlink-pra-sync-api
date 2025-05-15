import { BaseEvent } from '../../core/events';
import { Team } from '../models';

export interface TeamCreationFailedEventPayload {
    errorMessage: string;
    team: Team;
}

export class TeamCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-creation-failed';

    constructor(transactionId: string, payload: TeamCreationFailedEventPayload) {
        super(TeamCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
