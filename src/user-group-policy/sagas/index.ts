import { Injectable } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import { UsersSyncedEvent, UsersSyncedEventPayload } from '../../user/events';
import { SyncUserGroupPoliciesAfterUsersSyncedCommand } from '../commands';

@Injectable()
export class UserGroupPoliciesSaga {
    @Saga()
    public onUsersSyncedEvent = (events$: Observable<UsersSyncedEvent>): Observable<ICommand> => {
        return events$.pipe(
            ofType(UsersSyncedEvent),
            map(
                (event) =>
                    new SyncUserGroupPoliciesAfterUsersSyncedCommand(
                        event.transactionId,
                        (event.payload as UsersSyncedEventPayload).createdUserIds,
                        (event.payload as UsersSyncedEventPayload).updatedUserIds,
                        (event.payload as UsersSyncedEventPayload).deletedUserIds,
                    ),
            ),
        );
    };
}
