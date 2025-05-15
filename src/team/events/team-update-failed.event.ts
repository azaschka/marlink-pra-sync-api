import { BaseEvent } from '../../core/events';
import { Team } from '../models';

export interface TeamUpdateFailedEventPayload {
    errorMessage: string;
    team: Team;
}

export class TeamUpdateFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-update-failed';

    constructor(transactionId: string, payload: TeamUpdateFailedEventPayload) {
        super(TeamUpdateFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
