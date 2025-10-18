import { Injectable } from '@nestjs/common';
import { ICommand, Saga } from '@nestjs/cqrs';
import { EMPTY, Observable, filter, mergeMap, of } from 'rxjs';
import { GroupPoliciesSyncedEvent } from '../../group-policy/events';
import { SyncUserGroupPoliciesAfterUsersSyncedCommand } from '../commands';
import { UsersSyncedEvent, UsersSyncedEventPayload } from '../../user/events';

@Injectable()
export class UserGroupPolicySaga {
    private hasReceivedUsersSyncedEvent = false;
    private hasReceivedGroupPoliciesSyncedEvent = false;
    private lastUsersSyncedEvent: UsersSyncedEvent | null = null;

    @Saga()
    public onUsersSyncedEvent = (
        events$: Observable<UsersSyncedEvent | GroupPoliciesSyncedEvent>,
    ): Observable<ICommand> => {
        return events$.pipe(
            filter((event) => event instanceof UsersSyncedEvent || event instanceof GroupPoliciesSyncedEvent),
            mergeMap((event) => {
                if (event instanceof UsersSyncedEvent) {
                    this.hasReceivedUsersSyncedEvent = true;
                    this.lastUsersSyncedEvent = event;
                }

                if (event instanceof GroupPoliciesSyncedEvent) {
                    this.hasReceivedGroupPoliciesSyncedEvent = true;
                }

                if (
                    !this.hasReceivedUsersSyncedEvent ||
                    !this.hasReceivedGroupPoliciesSyncedEvent ||
                    this.lastUsersSyncedEvent === null
                ) {
                    return EMPTY;
                }

                const payload = this.lastUsersSyncedEvent.payload as UsersSyncedEventPayload;

                const command = new SyncUserGroupPoliciesAfterUsersSyncedCommand(
                    this.lastUsersSyncedEvent.transactionId,
                    payload.tenantId,
                    payload.createdUserIds,
                    payload.updatedUserIds,
                    payload.deletedUserIds,
                );

                // Reset the state so it doesn't emit again
                this.hasReceivedUsersSyncedEvent = false;
                this.hasReceivedGroupPoliciesSyncedEvent = false;
                this.lastUsersSyncedEvent = null;

                return of(command);
            }),
        );
    };
}
