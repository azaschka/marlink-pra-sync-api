import { BaseEvent } from '../../core/events';
import { BeyondtrustInstanceBackup } from '../models';

export interface BeyondtrustInstanceBackupCreatedEventPayload {
    beyondtrustInstanceBackup: BeyondtrustInstanceBackup;
}

export class BeyondtrustInstanceBackupCreatedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'beyondtrust-instance-backup-created';

    constructor(transactionId: string, payload: BeyondtrustInstanceBackupCreatedEventPayload) {
        super(BeyondtrustInstanceBackupCreatedEvent.EVENT_TYPE, payload, transactionId);
    }
}
