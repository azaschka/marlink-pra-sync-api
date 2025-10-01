import { BaseEvent } from '../../core/events';

export interface JumpClientInstallersSyncFailedEventPayload {
    errorMessage: string;
    tenantId: number;
}

export class JumpClientInstallersSyncFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-client-installers-sync-failed';

    constructor(transactionId: string, payload: JumpClientInstallersSyncFailedEventPayload) {
        super(JumpClientInstallersSyncFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
