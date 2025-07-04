import { BaseEvent } from '../../core/events';

export interface GroupPolicyTeamsSyncFailedEventPayload {
    errorMessage: string;
}

export class GroupPolicyTeamsSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-teams-sync-failed';

    constructor(transactionId: string, payload: GroupPolicyTeamsSyncFailedEventPayload) {
        super(GroupPolicyTeamsSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
