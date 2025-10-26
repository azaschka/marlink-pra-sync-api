import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { filter, mergeMap, Observable } from 'rxjs';
import { ScanEntityRelationDiscrepancyCommand } from '../commands';
import { DiscrepancyEntityType } from '../enums';
import { DiscrepancyScannedEvent } from '../events';

@Injectable()
export class UserSaga {
    @Saga()
    public onDiscrepancyScannedEvent = (events$: Observable<DiscrepancyScannedEvent>): Observable<ICommand> => {
        return events$.pipe(
            ofType(DiscrepancyScannedEvent),
            filter((event) => event.payload.discrepancyOverview.entityType === DiscrepancyEntityType.User),
            mergeMap((event) =>
                [DiscrepancyEntityType.UserGroupPolicy].map(
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
