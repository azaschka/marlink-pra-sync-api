import { Injectable } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import { TeamsSyncedEvent, TeamsSyncedEventPayload } from '../../team/events';
import { SyncTeamUsersAfterTeamsSyncedCommand } from '../commands';

@Injectable()
export class TeamUsersSaga {
    @Saga()
    public onTeamsSyncedEvent = (events$: Observable<TeamsSyncedEvent>): Observable<ICommand> => {
        return events$.pipe(
            ofType(TeamsSyncedEvent),
            map(
                (event) =>
                    new SyncTeamUsersAfterTeamsSyncedCommand(
                        event.transactionId,
                        (event.payload as TeamsSyncedEventPayload).createdTeamIds,
                        (event.payload as TeamsSyncedEventPayload).updatedTeamIds,
                        (event.payload as TeamsSyncedEventPayload).deletedTeamIds,
                    ),
            ),
        );
    };
}
