export type SyncStrategy<BT, DB, Entity> = {
    btRetrieveFunc: (
        transactionId: string,
        tenantId: number,
        maxBatchSize: number,
        pageNumber: number,
    ) => Promise<BT[]>;
    btOmittedPropsForDuplicateCheck?: (keyof BT)[];
    btToDbEntity: (bt: BT) => Entity;
    dbRetrieveFunc: (
        transactionId: string,
        tenantId: number,
        maxBatchSize: number,
        pageNumber: number,
    ) => Promise<DB[]>;
    dbMarkAsSyncedFunc: (transactionId: string, tenantId: number, id: number) => Promise<void>;
    trimmedProps: (keyof Entity)[];
};
