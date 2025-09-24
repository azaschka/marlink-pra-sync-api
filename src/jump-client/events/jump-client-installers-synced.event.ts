import { BaseEvent } from '../../core/events';

export interface JumpClientInstallersSyncedEventPayload {
    createdJumpClientInstallerIds: number[];
    updatedJumpClientInstallerIds: number[];
    deletedJumpClientInstallerIds: number[];
    tenantId: number;
}

export class JumpClientInstallersSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-client-installers-synced';

    constructor(transactionId: string, payload: JumpClientInstallersSyncedEventPayload) {
        super(JumpClientInstallersSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
