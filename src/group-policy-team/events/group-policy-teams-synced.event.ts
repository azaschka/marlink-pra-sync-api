import { BaseEvent } from '../../core/events';
import { GroupPolicyTeam } from '../models';

export interface GroupPolicyTeamsSyncedEventPayload {
    groupPolicyTeams: GroupPolicyTeam[];
}

export class GroupPolicyTeamsSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-teams-synced';

    constructor(transactionId: string, payload: GroupPolicyTeamsSyncedEventPayload) {
        super(GroupPolicyTeamsSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
