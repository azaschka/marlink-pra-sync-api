import { BaseEvent } from '../../core/events';

export interface BeyondtrustInstanceBackupCreationFailedEventPayload {
    errorMessage: string;
    beyondtrustInstanceId: number;
}

export class BeyondtrustInstanceBackupCreationFailedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'beyondtrust-instance-backup-creation-failed';

    constructor(transactionId: string, payload: BeyondtrustInstanceBackupCreationFailedEventPayload) {
        super(BeyondtrustInstanceBackupCreationFailedEvent.EVENT_TYPE, payload, transactionId);
    }
}
