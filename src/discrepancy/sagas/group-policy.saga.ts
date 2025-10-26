import { Injectable } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, filter, mergeMap } from 'rxjs';
import { ScanEntityRelationDiscrepancyCommand } from '../commands';
import { DiscrepancyEntityType } from '../enums';
import { DiscrepancyScannedEvent } from '../events';

@Injectable()
export class GroupPolicySaga {
    @Saga()
    public onDiscrepancyScannedEvent = (events$: Observable<DiscrepancyScannedEvent>): Observable<ICommand> => {
        return events$.pipe(
            ofType(DiscrepancyScannedEvent),
            filter((event) => event.payload.discrepancyOverview.entityType === DiscrepancyEntityType.GroupPolicy),
            mergeMap((event) =>
                [
                    DiscrepancyEntityType.GroupPolicyJumpGroup,
                    DiscrepancyEntityType.GroupPolicyJumpoint,
                    DiscrepancyEntityType.GroupPolicyMember,
                    DiscrepancyEntityType.GroupPolicyTeam,
                ].map(
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
