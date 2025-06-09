import { BaseEvent } from '../../../core/events';

export interface RemoteRdpsSyncedEventPayload {
    createdRemoteRdpIds: number[];
    updatedRemoteRdpIds: number[];
    deletedRemoteRdpIds: number[];
}

export class RemoteRdpsSyncedEvent extends BaseEvent {
    public static readonly EVENT_TYPE = 'remote-rdps-synced';

    constructor(transactionId: string, payload: RemoteRdpsSyncedEventPayload) {
        super(RemoteRdpsSyncedEvent.EVENT_TYPE, payload, transactionId);
    }
}
