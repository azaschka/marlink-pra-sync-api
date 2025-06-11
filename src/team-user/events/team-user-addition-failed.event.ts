import { BaseEvent } from '../../core/events';
import { TeamUser } from '../models';

export interface TeamUserAdditionFailedEventPayload {
    errorMessage: string;
    teamUser: TeamUser;
}

export class TeamUserAdditionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-user-addition-failed';

    constructor(transactionId: string, payload: TeamUserAdditionFailedEventPayload) {
        super(TeamUserAdditionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
