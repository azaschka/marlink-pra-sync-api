import { CreateJumpClientInstallerTenantTableEventHandler } from './create-jump-client-installer-tenant-table.event-handler';
import { CreateJumpClientTenantTableEventHandler } from './create-jump-client-tenant-table.event-handler';

export const EventHandlers = [
    CreateJumpClientTenantTableEventHandler,
    CreateJumpClientInstallerTenantTableEventHandler,
];
