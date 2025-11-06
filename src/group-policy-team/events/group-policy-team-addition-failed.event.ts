import { BaseEvent } from '../../core/events';
import { GroupPolicyTeam } from '../models';

export interface GroupPolicyTeamAdditionFailedEventPayload {
    errorMessage: string;
    groupPolicyTeam: GroupPolicyTeam;
    tenantId: number;
}

export class GroupPolicyTeamAdditionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-team-addition-failed';

    constructor(transactionId: string, payload: GroupPolicyTeamAdditionFailedEventPayload) {
        super(GroupPolicyTeamAdditionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
