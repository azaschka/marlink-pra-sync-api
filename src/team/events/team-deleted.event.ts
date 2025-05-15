import { BaseEvent } from '../../core/events';

export interface TeamDeletedEventPayload {
    id: number;
}

export class TeamDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'team-deleted';

    constructor(transactionId: string, payload: TeamDeletedEventPayload) {
        super(TeamDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
