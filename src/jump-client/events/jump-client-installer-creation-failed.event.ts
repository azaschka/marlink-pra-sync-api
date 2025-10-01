import { BaseEvent } from '../../core/events';
import { JumpClientInstaller } from '../models';

export interface JumpClientInstallerCreationFailedEventPayload {
    errorMessage: string;
    jumpClientInstaller: JumpClientInstaller;
    tenantId: number;
}

export class JumpClientInstallerCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'jump-client-installer-creation-failed';

    constructor(transactionId: string, payload: JumpClientInstallerCreationFailedEventPayload) {
        super(JumpClientInstallerCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
