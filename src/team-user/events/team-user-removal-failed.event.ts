import { BaseEvent } from '../../core/events';

export interface TeamUserRemovalFailedEventPayload {
    errorMessage: string;
    teamId: number;
    userId: number;
    tenantId: number;
}

export class TeamUserRemovalFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-user-removal-failed';

    constructor(transactionId: string, payload: TeamUserRemovalFailedEventPayload) {
        super(TeamUserRemovalFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
