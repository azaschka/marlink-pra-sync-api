import { BaseEvent } from '../../core/events';
import { GroupPolicyTeam } from '../models';

export interface GroupPolicyTeamAddedEventPayload {
    groupPolicyTeam: GroupPolicyTeam;
    tenantId: number;
}

export class GroupPolicyTeamAddedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-team-added';

    constructor(transactionId: string, payload: GroupPolicyTeamAddedEventPayload) {
        super(GroupPolicyTeamAddedEvent.EVENT_TYPE, payload, transactionId);
    }
}
