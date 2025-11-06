import { ScanDiscrepancyCommandHandler } from './scan-discrepancy.command-handler';
import { ScanEntityRelationDiscrepancyCommandHandler } from './scan-entity-relation-discrepancy.command-handler';
import { SyncDiscrepancyCommandHandler } from './sync-discrepancy.command-handler';

export const CommandHandlers = [
    ScanEntityRelationDiscrepancyCommandHandler,
    ScanDiscrepancyCommandHandler,
    SyncDiscrepancyCommandHandler,
];
