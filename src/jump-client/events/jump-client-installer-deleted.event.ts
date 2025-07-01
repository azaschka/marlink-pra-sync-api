import { BaseEvent } from '../../core/events';

export interface JumpClientInstallerDeletedEventPayload {
    id: number;
}

export class JumpClientInstallerDeletedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-client-installer-deleted';

    constructor(transactionId: string, payload: JumpClientInstallerDeletedEventPayload) {
        super(JumpClientInstallerDeletedEvent.EVENT_TYPE, payload, transactionId);
    }
}
