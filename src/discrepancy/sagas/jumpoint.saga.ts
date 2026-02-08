import { Injectable } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, concatMap, filter } from 'rxjs';
import { ScanEntityRelationDiscrepancyCommand } from '../commands';
import { DiscrepancyEntityType } from '../enums';
import { DiscrepancyScannedEvent } from '../events';

@Injectable()
export class JumpointSaga {
    @Saga()
    public onDiscrepancyScannedEvent = (events$: Observable<DiscrepancyScannedEvent>): Observable<ICommand> => {
        return events$.pipe(
            ofType(DiscrepancyScannedEvent),
            filter((event) => event.payload.discrepancyOverview.entityType === DiscrepancyEntityType.Jumpoint),
            concatMap((event) =>
                [DiscrepancyEntityType.JumpointNode].map(
                    (entityType) =>
                        new ScanEntityRelationDiscrepancyCommand(
                            event.transactionId,
                            event.payload.tenantId,
                            entityType,
                            event.payload.discrepancyOverview.identicalIds,
                            event.payload.discrepancyOverview.onlyInExternalIds,
                            event.payload.discrepancyOverview.onlyInInternalIds,
                            event.payload.discrepancyOverview.mismatchedIds,
                        ),
                ),
            ),
        );
    };
}
