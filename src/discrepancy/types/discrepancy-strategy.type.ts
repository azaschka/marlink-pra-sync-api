export type DiscrepancyStrategy<BT, DB, Entity> = {
    btRetrieveFunc: (
        transactionId: string,
        tenantId: number,
        maxBatchSize: number,
        pageNumber: number,
    ) => Promise<BT[]>;
    btCreateFunc: (transactionId: string, tenantId: number, entity: Entity) => Promise<void>;
    btModifyFunc: (transactionId: string, tenantId: number, entity: Entity) => Promise<void>;
    btDeleteFunc: (transactionId: string, tenantId: number, entity: Entity) => Promise<void>;
    btOmittedPropsForDuplicateCheck?: (keyof BT)[];
    btToDbEntity: (bt: BT) => Entity;
    dbRetrieveFunc: (
        transactionId: string,
        tenantId: number,
        maxBatchSize: number,
        pageNumber: number,
    ) => Promise<DB[]>;
    dbCreateOrUpdateFunc: (tenantId: number, entity: Entity) => Promise<void>;
    dbDeleteFunc: (tenantId: number, entity: Entity) => Promise<void>;
    dbMarkAsSyncedFunc: (transactionId: string, tenantId: number, entity: Entity) => Promise<void>;
    trimmedProps: (keyof Entity)[];
    relationalEntityComparisonProps?: {
        parent: keyof Entity;
        child: keyof Entity;
    };
};
