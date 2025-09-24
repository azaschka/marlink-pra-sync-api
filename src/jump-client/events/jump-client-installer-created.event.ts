import { BaseEvent } from '../../core/events';
import { JumpClientInstaller } from '../models';

export interface JumpClientInstallerCreatedEventPayload {
    jumpClientInstaller: JumpClientInstaller;
    tenantId: number;
}

export class JumpClientInstallerCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-client-installer-created';

    constructor(transactionId: string, payload: JumpClientInstallerCreatedEventPayload) {
        super(JumpClientInstallerCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
