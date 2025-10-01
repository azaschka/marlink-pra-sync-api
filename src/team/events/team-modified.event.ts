import { BaseEvent } from '../../core/events';
import { Team } from '../models';

export interface TeamModifiedEventPayload {
    team: Team;
    tenantId: number;
}

export class TeamModifiedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-modified';

    constructor(transactionId: string, payload: TeamModifiedEventPayload) {
        super(TeamModifiedEvent.EVENT_TYPE, payload, transactionId);
    }
}
