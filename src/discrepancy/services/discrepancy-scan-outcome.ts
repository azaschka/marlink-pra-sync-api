import { QueryFailedError } from 'typeorm';
import { BtApiError, BtApiErrorKind } from '../../beyondtrust-pra-conf-api/http-client/errors/bt-api-error';
import { ScanAbortedError, ScanContext } from '../../shared/context/scan-context';
import { DiscrepancyEntityType, DiscrepancyScanState } from '../enums';
import { DiscrepancyOverview } from '../models';

/** Helpers that turn scan results and failures into honest, comparable outcomes and log lines. */
export abstract class DiscrepancyScanOutcome {
    public static readonly INSTANCE_UNAVAILABLE = 'InstanceUnavailable';
    public static readonly DATABASE = 'Database';
    public static readonly INTERNAL = 'Internal';

    /** Failures that say the BeyondTrust instance (or the way to it) is unusable, not that one type is broken. */
    private static readonly UNAVAILABILITY_KINDS: ReadonlySet<string> = new Set([
        BtApiErrorKind.Transient,
        BtApiErrorKind.ProxyConnectFailure,
        BtApiErrorKind.UnexpectedResponse,
        BtApiErrorKind.NotFound,
    ]);

    public static failureKindOf(error: unknown): string {
        if (error instanceof BtApiError) {
            return error.kind;
        }

        if (error instanceof ScanAbortedError) {
            return BtApiErrorKind.Cancelled;
        }

        if (error instanceof QueryFailedError || (error as { driverError?: unknown } | undefined)?.driverError) {
            return DiscrepancyScanOutcome.DATABASE;
        }

        return DiscrepancyScanOutcome.INTERNAL;
    }

    public static isAbort(error: unknown): boolean {
        return (
            error instanceof ScanAbortedError ||
            (error instanceof BtApiError && error.kind === BtApiErrorKind.Cancelled) ||
            ScanContext.isAborted()
        );
    }

    /** Overview without data for a type that did not complete. The ID lists are empty, never "everything gone". */
    public static incomplete(
        entityType: DiscrepancyEntityType,
        state: DiscrepancyScanState,
        failureKind?: string,
    ): DiscrepancyOverview {
        return {
            entityType,
            totalBtData: 0,
            totalDbData: 0,
            identicalIds: [],
            onlyInExternalIds: [],
            onlyInInternalIds: [],
            mismatchedIds: [],
            state,
            failureKind,
        };
    }

    public static fromError(entityType: DiscrepancyEntityType, error: unknown): DiscrepancyOverview {
        return DiscrepancyScanOutcome.isAbort(error)
            ? DiscrepancyScanOutcome.incomplete(entityType, DiscrepancyScanState.Aborted, BtApiErrorKind.Cancelled)
            : DiscrepancyScanOutcome.incomplete(
                  entityType,
                  DiscrepancyScanState.Failed,
                  DiscrepancyScanOutcome.failureKindOf(error),
              );
    }

    public static indicatesUnavailableInstance(overview: DiscrepancyOverview): boolean {
        return (
            overview.state === DiscrepancyScanState.Failed &&
            overview.failureKind !== undefined &&
            DiscrepancyScanOutcome.UNAVAILABILITY_KINDS.has(overview.failureKind)
        );
    }

    /** "3 succeeded, 1 failed (UnexpectedResponse x1), 10 skipped, 0 aborted" */
    public static summarize(overviews: DiscrepancyOverview[]): { text: string; allSucceeded: boolean } {
        const count = (state: DiscrepancyScanState) => overviews.filter((o) => o.state === state).length;
        const failureKinds = new Map<string, number>();

        for (const overview of overviews) {
            if (overview.state === DiscrepancyScanState.Failed) {
                const kind = overview.failureKind ?? DiscrepancyScanOutcome.INTERNAL;
                failureKinds.set(kind, (failureKinds.get(kind) ?? 0) + 1);
            }
        }

        const failed = count(DiscrepancyScanState.Failed);
        const kinds = [...failureKinds.entries()].map(([kind, n]) => `${kind} x${n}`).join(', ');
        const text = [
            `${count(DiscrepancyScanState.Succeeded)} succeeded`,
            `${count(DiscrepancyScanState.Partial)} partial`,
            `${failed} failed${kinds ? ` (${kinds})` : ''}`,
            `${count(DiscrepancyScanState.Skipped)} skipped`,
            `${count(DiscrepancyScanState.Aborted)} aborted`,
        ].join(', ');

        return {
            text,
            allSucceeded: overviews.every((overview) => overview.state === DiscrepancyScanState.Succeeded),
        };
    }

    /** Prefix for log lines that belong to a scan. */
    public static logPrefix(tenantId: number): string {
        return `[scan ${ScanContext.current()?.scanId ?? 'n/a'}] tenant ${tenantId}`;
    }
}
