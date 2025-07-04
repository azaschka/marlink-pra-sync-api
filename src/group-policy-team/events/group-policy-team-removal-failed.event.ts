import { BaseEvent } from '../../core/events';

export interface GroupPolicyTeamRemovalFailedEventPayload {
    errorMessage: string;
    groupPolicyId: number;
    teamId: number;
}

export class GroupPolicyTeamRemovalFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-team-removal-failed';

    constructor(transactionId: string, payload: GroupPolicyTeamRemovalFailedEventPayload) {
        super(GroupPolicyTeamRemovalFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
