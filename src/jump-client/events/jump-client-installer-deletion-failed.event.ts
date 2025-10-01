import { BaseEvent } from '../../core/events';

export interface JumpClientInstallerDeletionFailedEventPayload {
    errorMessage: string;
    id: number;
    tenantId: number;
}

export class JumpClientInstallerDeletionFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-client-installer-deletion-failed';

    constructor(transactionId: string, payload: JumpClientInstallerDeletionFailedEventPayload) {
        super(JumpClientInstallerDeletionFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
