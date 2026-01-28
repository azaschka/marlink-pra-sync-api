import { CreateDiscrepancyTenantTableEventHandler } from './create-discrepancy-tenant-table.event-handler';
import { SyncAfterDiscrepancyFoundEventHandler } from './sync-after-discrepancy-found.event-handler';

export const EventHandlers = [CreateDiscrepancyTenantTableEventHandler, SyncAfterDiscrepancyFoundEventHandler];
