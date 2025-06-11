import { BaseEvent } from '../../core/events';

export interface TeamUserRemovedEventPayload {
    teamId: number;
    userId: number;
}

export class TeamUserRemovedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-user-removed';

    constructor(transactionId: string, payload: TeamUserRemovedEventPayload) {
        super(TeamUserRemovedEvent.EVENT_TYPE, payload, transactionId);
    }
}
