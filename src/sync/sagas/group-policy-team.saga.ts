import { Injectable } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import { GroupPoliciesSyncedEvent, GroupPoliciesSyncedEventPayload } from '../../group-policy/events';
import { SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommand } from '../../sync/commands';

@Injectable()
export class GroupPolicyTeamSaga {
    @Saga()
    public onGroupPoliciesSyncedEvent = (events$: Observable<GroupPoliciesSyncedEvent>): Observable<ICommand> => {
        return events$.pipe(
            ofType(GroupPoliciesSyncedEvent),
            map(
                (event) =>
                    new SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommand(
                        event.transactionId,
                        (event.payload as GroupPoliciesSyncedEventPayload).tenantId,
                        (event.payload as GroupPoliciesSyncedEventPayload).createdGroupPolicyIds,
                        (event.payload as GroupPoliciesSyncedEventPayload).updatedGroupPolicyIds,
                        (event.payload as GroupPoliciesSyncedEventPayload).deletedGroupPolicyIds,
                    ),
            ),
        );
    };
}
