import { SyncEntityType } from '../enums';

export class SyncComparatorCommand {
    public readonly commandType = 'sync-comparator';

    constructor(
        public readonly transactionId: string,
        public readonly tenantId: number,
        public readonly syncEntityType: SyncEntityType,
    ) {}
}
