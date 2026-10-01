/** Final state of a scan of one entity type (or of one relation type across its parents). */
export enum DiscrepancyScanState {
    Succeeded = 'succeeded',
    /** Relation scans only: some parents succeeded, others failed. */
    Partial = 'partial',
    Failed = 'failed',
    /** Not attempted, e.g. because the BeyondTrust instance was found unavailable earlier in the cycle. */
    Skipped = 'skipped',
    /** Not finished because the cycle budget expired. */
    Aborted = 'aborted',
}
