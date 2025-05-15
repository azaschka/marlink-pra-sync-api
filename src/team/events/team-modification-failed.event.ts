import { BaseEvent } from '../../core/events';
import { Team } from '../models';

export interface TeamModificationFailedEventPayload {
    errorMessage: string;
    team: Team;
}

export class TeamModificationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-modification-failed';

    constructor(transactionId: string, payload: TeamModificationFailedEventPayload) {
        super(TeamModificationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
