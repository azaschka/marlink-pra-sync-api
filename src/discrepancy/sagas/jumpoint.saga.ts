import { Injectable } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import { JumpointsSyncedEvent, JumpointsSyncedEventPayload } from '../../jumpoint/events';
import { SyncJumpointNodesAfterJumpointsSyncedCommand } from '../commands';

@Injectable()
export class JumpointSaga {
    @Saga()
    public onJumpointsSyncedEvent = (events$: Observable<JumpointsSyncedEvent>): Observable<ICommand> => {
        return events$.pipe(
            ofType(JumpointsSyncedEvent),
            map(
                (event) =>
                    new SyncJumpointNodesAfterJumpointsSyncedCommand(
                        event.transactionId,
                        (event.payload as JumpointsSyncedEventPayload).tenantId,
                        (event.payload as JumpointsSyncedEventPayload).createdJumpointIds,
                        (event.payload as JumpointsSyncedEventPayload).updatedJumpointIds,
                        (event.payload as JumpointsSyncedEventPayload).deletedJumpointIds,
                    ),
            ),
        );
    };
}
