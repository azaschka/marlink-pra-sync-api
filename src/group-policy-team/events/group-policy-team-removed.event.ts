import { BaseEvent } from '../../core/events';

export interface GroupPolicyTeamRemovedEventPayload {
    groupPolicyId: number;
    teamId: number;
    tenantId: number;
}

export class GroupPolicyTeamRemovedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'group-policy-team-removed';

    constructor(transactionId: string, payload: GroupPolicyTeamRemovedEventPayload) {
        super(GroupPolicyTeamRemovedEvent.EVENT_TYPE, payload, transactionId);
    }
}
